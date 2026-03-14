<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Service } from '../api/generated'
import type { WarningMessageResponse, ArticleResponse } from '../api/generated'

const router = useRouter()

// 响应式数据
const activeWarnings = ref<WarningMessageResponse[]>([])
const latestArticles = ref<ArticleResponse[]>([])
const loading = ref(false)

// 轮播图模拟数据 (实际开发可从后端获取)
const banners = [
  { id: 1, image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg', title: '春季苹果防病指南' },
  { id: 2, image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg', title: '果康云专家在线答疑' }
]

// 快捷入口配置
const menuItems = [
  { icon: 'search', text: '病虫百科', path: '/encyclopedia', color: '#07c160' },
  { icon: 'records-o', text: '治理记录', path: '/record/list', color: '#1989fa' },
  { icon: 'edit', text: '发布求助', path: '/post/create', color: '#ff976a' },
  { icon: 'warn-o', text: '灾情预警', path: '/message/list', color: '#ee0a24' }
]

const fetchData = async () => {
  loading.value = true
  try {
    // 并发请求：获取活跃预警和最新文章
    const [warnings, articles] = await Promise.all([
      Service.readActiveWarningsApiV1WarningActiveGet(0, 5),
      Service.readArticlesApiV1CommunityArticlesGet(0, 3)
    ])
    activeWarnings.value = warnings
    latestArticles.value = articles
  } catch (error) {
    console.error('首页数据加载失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const navigateTo = (path: string) => router.push(path)
</script>

<template>
  <div class="home-container">
    <van-nav-bar title="果康云" fixed placeholder border />

    <van-notice-bar
      v-if="activeWarnings.length > 0"
      left-icon="volume-o"
      mode="link"
      :text="activeWarnings.map(w => w.affected_scope + ': ' + w.prevention_measures).join(' | ')"
      @click="navigateTo('/message/list')"
    />

    <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white">
      <van-swipe-item v-for="item in banners" :key="item.id">
        <img :src="item.image" />
        <div class="swipe-title">{{ item.title }}</div>
      </van-swipe-item>
    </van-swipe>

    <van-grid :column-num="4" :border="false" class="menu-grid">
      <van-grid-item
        v-for="item in menuItems"
        :key="item.text"
        :icon="item.icon"
        :text="item.text"
        :icon-color="item.color"
        @click="navigateTo(item.path)"
      />
    </van-grid>

    <div class="section-header">
      <span class="title">农技课堂</span>
      <span class="more" @click="navigateTo('/community')">更多 ></span>
    </div>

    <van-skeleton title avatar :row="3" :loading="loading">
      <div class="article-list">
        <van-card
          v-for="article in latestArticles"
          :key="article.id"
          :desc="article.content"
          :title="article.title"
          thumb="https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg"
          @click="navigateTo(`/article/detail/${article.id}`)"
        >
          <template #tags>
            <van-tag plain type="primary" style="margin-right: 5px;">专家推荐</van-tag>
          </template>
          <template #footer>
            <span class="date">{{ new Date(article.create_at).toLocaleDateString() }}</span>
          </template>
        </van-card>
      </div>
    </van-skeleton>
    
  </div>
</template>

<style scoped>
.home-container {
  background-color: #f7f8fa;
}

.my-swipe {
  height: 180px;
  margin: 10px;
  border-radius: 12px;
  overflow: hidden;
}

.my-swipe img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.swipe-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 14px;
}

.menu-grid {
  margin: 10px;
  background: #fff;
  border-radius: 12px;
  padding: 10px 0;
}

.section-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header .title {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
}

.section-header .more {
  font-size: 13px;
  color: #969799;
}

.article-list {
  padding: 0 10px;
}

.article-list :deep(.van-card) {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
}

.date {
  font-size: 12px;
  color: #969799;
}

.bottom-space {
  height: 60px;
}
</style>