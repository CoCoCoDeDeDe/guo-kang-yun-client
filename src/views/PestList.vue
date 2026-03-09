<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Service } from '../api/generated'
import type { PestInfoResponse } from '../api/generated'
import { PestCategoryEnum } from '../api/generated/models/PestCategoryEnum'

const router = useRouter()

// 状态变量
const list = ref<PestInfoResponse[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const searchText = ref('')
const activeTab = ref<string>('全部')

// 分类映射（根据 PestCategoryEnum 定义）
const categories = ['全部', '害虫', '病害', '杂草', '其他']

// 分页参数
let skip = 0
const limit = 10

const onLoad = async () => {
  try {
    if (refreshing.value) {
      list.value = []
      refreshing.value = false
      skip = 0
    }

    // 调用 API 获取病虫害数据
    const res = await Service.readPestsApiV1KnowledgePestsGet(skip, limit)
    
    list.value.push(...res)
    skip += limit
    loading.value = false

    // 如果返回数据少于 limit，说明加载完毕
    if (res.length < limit) {
      finished.value = true
    }
  } catch (error) {
    console.error('加载失败', error)
    finished.value = true
  }
}

const onRefresh = () => {
  // 清空列表数据
  finished.value = false
  // 将 loading 设置为 true，表示正在加载
  loading.value = true
  onLoad()
}

const onSearch = () => {
  // 搜索逻辑：实际项目中通常由后端过滤，此处演示重置列表
  refreshing.value = true
  onRefresh()
}

const goToDetail = (id: number) => {
  router.push(`/pest/detail/${id}`)
}

// 格式化分类显示
const formatCategory = (cat: string) => {
  // 这里的 cat 是后端返回的 Enum 字符串
  return cat || '未知'
}
</script>

<template>
  <div class="pest-list-container">
    <van-nav-bar title="病虫害百科" fixed placeholder border />

    <van-search
      v-model="searchText"
      placeholder="搜索病虫害名称、防治药物..."
      shape="round"
      @search="onSearch"
    />

    <van-tabs v-model:active="activeTab" sticky offset-top="0">
      <van-tab v-for="cat in categories" :title="cat" :key="cat">
        
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
            class="data-list"
          >
            <div 
              v-for="item in list" 
              :key="item.id" 
              class="pest-card van-hairline--bottom"
              @click="goToDetail(item.id!)"
            >
              <van-image
                width="100"
                height="80"
                fit="cover"
                radius="8"
                :src="item.typical_image || 'https://fastly.jsdelivr.net/npm/@vant/assets/tree.jpeg'"
                class="pest-image"
              />
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

      </van-tab>
    </van-tabs>

    <div class="bottom-placeholder"></div>
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

.bottom-placeholder {
  height: 60px; /* Tabbar 的高度 */
}

/* 调整搜索栏背景色 */
:deep(.van-search) {
  padding: 10px 15px;
}
</style>