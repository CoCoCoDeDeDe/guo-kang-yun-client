<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Service } from '../api/generated'
import type { PestInfoResponse } from '../api/generated'

// 获取真实后端地址
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const router = useRouter()

// 状态变量
const list = ref<PestInfoResponse[]>([])
const loading = ref(false)   // 由 van-list 自动控制 true，由我们手动控制 false
const finished = ref(false)
const refreshing = ref(false)
const searchText = ref('')
const activeTab = ref<string>('全部')

const categories = ['全部', '害虫', '病害', '杂草', '其他']

// 分页参数
let skip = 0
const limit = 10

// 内部锁，防止手动调用 onRefresh 和 van-list 自动触发冲突
let isFetching = false

// 默认占位图
const defaultThumb = 'https://fastly.jsdelivr.net/npm/@vant/assets/tree.jpeg'

// 辅助函数：获取完整图片真实地址
const getImageUrl = (url?: string | null) => {
  if (!url) return defaultThumb
  if (url.startsWith('http')) return url
  
  const cleanBase = API_BASE.replace(/\/$/, '')
  const cleanUrl = url.startsWith('/') ? url : `/${url}`
  
  return `${cleanBase}${cleanUrl}`
}

const onLoad = async () => {
  // 1. 如果已经加载完成，或者正在进行网络请求，直接返回
  if (finished.value || isFetching) return;

  try {
    isFetching = true;
    loading.value = true; // 确保加载状态开启

    // 调用 API 获取数据
    const res = await Service.readPestsApiV1KnowledgePestsGet(skip, limit)

    if (refreshing.value) {
      list.value = res // 下拉刷新
      refreshing.value = false
    } else {
      list.value.push(...res) // 追加数据
    }

    skip += limit

    // 判断是否加载完毕
    if (res.length < limit) {
      finished.value = true
    }
  } catch (error) {
    console.error('加载失败', error)
    finished.value = true
  } finally {
    isFetching = false;
    loading.value = false; // 关键：请求结束后必须手动关闭 loading 状态
  }
}

// 监听标签切换
watch(activeTab, () => {
  onRefresh()
})

const onRefresh = () => {
  // 下拉刷新或切换标签时，立即重置状态
  finished.value = false
  skip = 0
  // 列表清空（可选：为了更好的视觉反馈，建议切换标签时清空旧数据）
  list.value = []

  // 如果 refreshing 是 false（说明是切换标签触发的），手动调用一次 onLoad
  if (!refreshing.value) {
    onLoad()
  }
}

const onSearch = () => {
  onRefresh()
}

const goToDetail = (id: number) => {
  router.push(`/pest/detail/${id}`)
}

const formatCategory = (cat: string) => cat || '未知'
</script>

<template>
  <div class="pest-list-container">
    <van-nav-bar title="病虫害百科" fixed placeholder border />

    <van-search v-model="searchText" placeholder="搜索病虫害名称..." shape="round" @search="onSearch" />

    <van-tabs v-model:active="activeTab" sticky offset-top="0">
      <van-tab v-for="cat in categories" :title="cat" :key="cat" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad" class="data-list"
        :immediate-check="false">
        <div v-for="item in list" :key="item.id" class="pest-card van-hairline--bottom" @click="goToDetail(item.id!)">
          
          <van-image width="100" height="80" fit="cover" radius="8"
            :src="getImageUrl(item.typical_image)" class="pest-image" />
            
          <div class="pest-info">
            <h3 class="pest-name">{{ item.name }}</h3>
            <van-tag plain type="success" class="pest-tag">{{ formatCategory(item.category) }}</van-tag>
            <p class="pest-desc van-multi-ellipsis--l2">
              {{ item.symptom_description }}
            </p>
          </div>
          <van-icon name="arrow" color="#ccc" />
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<style scoped>
/* 保持原有样式不变 */
.pest-list-container {
  background-color: #fff;
}

.data-list {
  padding: 0 15px;
}

.pest-card {
  display: flex;
  align-items: center;
  padding: 15px 0;
  gap: 12px;
}

.pest-info {
  flex: 1;
}

.pest-name {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #323233;
}

.pest-tag {
  margin-bottom: 5px;
}

.pest-desc {
  margin: 0;
  font-size: 13px;
  color: #969799;
  line-height: 1.5;
}

.bottom-placeholder {
  height: 60px;
  /* Tabbar 的高度 */
}

/* 调整搜索栏背景色 */
:deep(.van-search) {
  padding: 10px 15px;
}
</style>