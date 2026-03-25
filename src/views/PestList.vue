<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

// 👇 修复点1：页面初始化时，主动拉取第一页数据
onMounted(() => {
  onLoad()
})

const onRefresh = () => {
  // 下拉刷新时，立即重置状态
  finished.value = false
  skip = 0
  
  // 主动触发刷新请求
  if (!refreshing.value) {
    onLoad()
  }
}

const goToDetail = (id: number) => {
  router.push(`/pest/detail/${id}`)
}

const formatCategory = (cat: string) => cat || '未知'
</script>

<template>
  <div class="pest-list-container">
    <van-nav-bar title="病虫害百科" fixed placeholder border />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list 
        v-model:loading="loading" 
        :finished="finished" 
        finished-text="没有更多了" 
        @load="onLoad" 
        class="data-list"
      >
        <div v-for="item in list" :key="item.id" class="pest-card van-hairline--bottom" @click="goToDetail(item.id!)">
          
          <van-image width="100" height="80" fit="cover" radius="8"
            :src="getImageUrl(item.typical_image)" class="pest-image" />
            
          <div class="pest-info">
            <h3 class="pest-name">{{ item.name }}</h3>
            <van-tag plain type="success" class="pest-tag">{{ formatCategory(item.category) }}</van-tag>
            <p class="pest-desc van-multi-ellipsis--l2">
              {{ item.symptom_description || '暂无描述' }}
            </p>
          </div>
          <van-icon name="arrow" color="#ccc" />
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<style scoped>
.pest-list-container {
  background-color: #fff;
  min-height: 100vh;
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
</style>