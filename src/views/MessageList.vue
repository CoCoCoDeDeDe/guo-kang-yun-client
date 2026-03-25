<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { Service } from '../api/generated'
import type { WarningMessageResponse } from '../api/generated'

const router = useRouter()

// 状态变量
const list = ref<WarningMessageResponse[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

let skip = 0
const limit = 10

// 加载数据
const onLoad = async () => {
  if (finished.value) return

  try {
    loading.value = true
    // 调用获取有效预警信息的 API
    // (如果后续后端增加了"个人系统通知"的独立接口，可以在此处通过 Promise.all 并发获取并合并)
    const res = await Service.readActiveWarningsApiV1WarningActiveGet(skip, limit)

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
    console.error('获取消息失败', error)
    finished.value = true
    showToast('获取消息失败，请检查网络')
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

// 路由：返回个人中心
const onClickLeft = () => {
  router.push('/profile')
}

// 路由：点击前往详情
const goToDetail = (id: number) => {
  router.push(`/message/detail/${id}`)
}

// 辅助函数：格式化时间
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未知时间'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 辅助函数：根据预警等级匹配 UI 样式
const getLevelProps = (level?: string) => {
  // 根据常见的自然灾害预警级别进行映射 (如果后端枚举是英文，请替换为对应的英文)
  switch (level) {
    case '红色':
    case 'RED':
      return { color: '#ee0a24', icon: 'warn-o', tagType: 'danger' }
    case '橙色':
    case 'ORANGE':
      return { color: '#ff976a', icon: 'warning-o', tagType: 'warning' }
    case '黄色':
    case 'YELLOW':
      return { color: '#ffc21c', icon: 'info-o', tagType: 'warning' } // Vant 没有原生的黄标，用 warning 替代
    case '蓝色':
    case 'BLUE':
      return { color: '#1989fa', icon: 'bulb-o', tagType: 'primary' }
    default:
      // 默认视作系统普通通知
      return { color: '#07c160', icon: 'volume-o', tagType: 'success' } 
  }
}
</script>

<template>
  <div class="message-list-container">
    <van-nav-bar 
      title="消息中心" 
      left-text="返回" 
      left-arrow 
      fixed 
      placeholder 
      safe-area-inset-top @click-left="onClickLeft" 
    />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="pull-refresh-wrap">
      
      <van-empty v-if="list.length === 0 && !loading && !refreshing" description="暂无新消息" />

      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多消息了"
        @load="onLoad"
      >
        <div class="message-wrapper">
          <div 
            v-for="item in list" 
            :key="item.id" 
            class="message-card"
            @click="goToDetail(item.id!)"
          >
            <div class="card-header van-hairline--bottom">
              <div class="level-info" :style="{ color: getLevelProps(item.level as string).color }">
                <van-icon :name="getLevelProps(item.level as string).icon" size="18" />
                <span class="level-text">{{ item.level }}预警</span>
              </div>
              <span class="time">{{ formatDate(item.publish_time) }}</span>
            </div>
            
            <div class="card-body">
              <h3 class="title">受影响区域: {{ item.affected_scope || '全局' }}</h3>
              <p class="content van-multi-ellipsis--l2">
                {{ item.prevention_measures }}
              </p>
            </div>
            
            <div class="card-footer">
              <span class="view-detail">查看详情 <van-icon name="arrow" /></span>
            </div>
          </div>
        </div>
      </van-list>
      
    </van-pull-refresh>
  </div>
</template>

<style scoped>
.message-list-container {
  background-color: #f7f8fa;
  min-height: 100vh;
}

.pull-refresh-wrap {
  min-height: calc(100vh - 46px);
}

.message-wrapper {
  padding: 12px;
}

/* 消息卡片样式 */
.message-card {
  background-color: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: transform 0.1s;
}

.message-card:active {
  transform: scale(0.98);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: bold;
}

.card-header .time {
  font-size: 12px;
  color: #969799;
}

.card-body {
  padding: 12px 16px;
}

.card-body .title {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 600;
  color: #323233;
}

.card-body .content {
  margin: 0;
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
}

.card-footer {
  padding: 10px 16px;
  text-align: right;
  background-color: #fafafa;
}

.view-detail {
  font-size: 13px;
  color: #969799;
  display: inline-flex;
  align-items: center;
}
</style>