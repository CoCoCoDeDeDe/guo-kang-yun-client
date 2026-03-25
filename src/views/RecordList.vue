<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Service } from '../api/generated'
import type { GovernanceRecordResponse } from '../api/generated'

// 获取真实后端地址
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const router = useRouter()

// 列表状态
const list = ref<GovernanceRecordResponse[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 分页参数
let skip = 0
const limit = 10

// 加载数据
const onLoad = async () => {
  if (finished.value) return

  try {
    loading.value = true
    // 调用 API 获取当前用户的治理记录
    const res = await Service.readMyRecordsApiV1GovernanceMeGet(skip, limit)

    if (refreshing.value) {
      list.value = res
      refreshing.value = false
    } else {
      list.value.push(...res)
    }

    skip += limit
    if (res.length < limit) {
      finished.value = true
    }
  } catch (error) {
    console.error('获取治理记录失败', error)
    finished.value = true
  } finally {
    loading.value = false
  }
}

// 刷新列表
const onRefresh = () => {
  finished.value = false
  skip = 0
  refreshing.value = true
  onLoad()
}

// 路由规则实现
const onClickLeft = () => {
  router.push('/profile')
}

const goToForm = () => {
  router.push('/record/form')
}

const goToDetail = (id: number) => {
  router.push(`/record/detail/${id}`)
}

// 辅助函数：格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未知时间'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 辅助函数：获取完整图片真实地址
const getImageUrl = (url?: string) => {
  if (!url) return 'https://fastly.jsdelivr.net/npm/@vant/assets/tree.jpeg' // 默认占位图
  if (url.startsWith('http')) return url // 如果已经是绝对路径，直接返回
  
  // 处理斜杠，防止出现类似 http://127.0.0.1:8000//static/... 的情况
  const cleanBase = API_BASE.replace(/\/$/, '')
  const cleanUrl = url.startsWith('/') ? url : `/${url}`
  
  return `${cleanBase}${cleanUrl}`
}

// 辅助函数：解析状态标签颜色与文案
const getStatusProps = (status?: string) => {
  switch (status) {
    case 'completed':
      return { type: 'success', text: '已解决', color: '#07c160' }
    case 'in_progress':
      return { type: 'primary', text: '治理中', color: '#1989fa' }
    case 'cancelled':
      return { type: 'warning', text: '已取消', color: '#ff976a' }
    default:
      return { type: 'default', text: '未知状态', color: '#969799' }
  }
}
</script>

<template>
  <div class="record-list-container">
    <van-nav-bar 
      title="我的治理记录" 
      left-text="返回" 
      left-arrow 
      fixed 
      placeholder 
      safe-area-inset-top @click-left="onClickLeft"
    >
      <template #right>
        <van-icon name="plus" size="18" @click="goToForm" />
      </template>
    </van-nav-bar>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="pull-refresh-wrap">
      
      <van-empty v-if="list.length === 0 && !loading && !refreshing" description="暂无治理记录" />

      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多记录了"
        @load="onLoad"
      >
        <div class="list-wrapper">
          <div 
            v-for="item in list" 
            :key="item.id" 
            class="record-card"
            @click="goToDetail(item.id!)"
            :style="{ '--card-bar-color': getStatusProps(item.status as string).color }"
          >
            <div class="card-header van-hairline--bottom">
              <span class="date"><van-icon name="clock-o" /> {{ formatDate(item.found_time) }}</span>
              <van-tag 
                :type="getStatusProps(item.status as string).type as any" 
                plain
              >
                {{ getStatusProps(item.status as string).text }}
              </van-tag>
            </div>
            
            <div class="card-body">
              <div class="info-content">
                <h3 class="title">病虫害: {{ item.pest_type || '未指定' }}</h3>
                <p class="desc van-multi-ellipsis--l2">
                  果园位置: {{ item.location || '未填写' }}
                </p>
                <p class="desc van-multi-ellipsis--l2">
                  使用药物: {{ item.description || '无' }}
                </p>
              </div>
              
              <van-image
                class="thumb"
                width="70"
                height="70"
                radius="8"
                fit="cover"
                :src="getImageUrl(item.photos?.[0])"
              />
            </div>
            
            <div class="card-footer">
              <span class="view-detail">查看详情 <van-icon name="arrow" /></span>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <div class="fab-button" @click="goToForm">
      <van-icon name="edit" />
    </div>
  </div>
</template>
<style scoped>
.record-list-container {
  background-color: #f7f8fa;
  min-height: 100vh;
}

.pull-refresh-wrap {
  min-height: calc(100vh - 46px); /* 减去 nav-bar 高度，确保空数据时下拉刷新区域能撑开 */
}

.list-wrapper {
  padding: 12px;
}

/* 卡片样式 */
.record-card {
  background-color: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  position: relative;
  /* 默认颜色，会被内联样式覆盖 */
  --card-bar-color: #07c160; 
}

/* 左侧颜色装饰条，使用 CSS 变量动态绑定颜色 */
.record-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: var(--card-bar-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.card-header .date {
  font-size: 13px;
  color: #969799;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-body {
  display: flex;
  padding: 12px 16px;
  gap: 12px;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-content .title {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: bold;
  color: #323233;
}

.info-content .desc {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #646566;
}

.thumb {
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.card-footer {
  padding: 10px 16px;
  text-align: right;
  background-color: #fafafa;
}

.view-detail {
  font-size: 13px;
  color: #1989fa;
  display: inline-flex;
  align-items: center;
}

/* 悬浮新增按钮 */
.fab-button {
  position: fixed;
  right: 20px;
  bottom: 40px;
  width: 50px;
  height: 50px;
  background-color: #07c160;
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.4);
  z-index: 99;
  transition: transform 0.1s;
}

.fab-button:active {
  transform: scale(0.9);
}
</style>