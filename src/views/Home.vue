<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Service } from '../api/generated'
import type { WarningMessageResponse, ArticleResponse } from '../api/generated'

const router = useRouter()

// 状态变量
const warnings = ref<WarningMessageResponse[]>([])
const articles = ref<ArticleResponse[]>([])
const loading = ref(false)

// 轮播图模拟数据（实际项目中可替换为后端获取）
const banners = [
  { id: 1, image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg', title: '春季果园防病指南' },
  { id: 2, image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg', title: '果农治理经验分享' }
]

// 快捷入口配置（按要求绑定路由）
const menuItems = [
  { icon: 'search', text: '病虫百科', path: '/encyclopedia', color: '#07c160' },
  { icon: 'edit', text: '治理填报', path: '/record/form', color: '#1989fa' }, // 点击治理 -> /record/form
  { icon: 'chat-o', text: '互动社区', path: '/community', color: '#ff976a' },
  { icon: 'warn-o', text: '预警详情', path: '/message/detail', color: '#ee0a24' } // 快捷方式前往预警详情
]

// 获取首页数据
const fetchHomeData = async () => {
  loading.value = true
  try {
    // 并发请求：获取当前生效的预警和最新的科普文章
    const [warningRes, articleRes] = await Promise.all([
      Service.readActiveWarningsApiV1WarningActiveGet(0, 5),
      Service.readArticlesApiV1CommunityArticlesGet(0, 5) // 获取5篇热门文章
    ])
    warnings.value = warningRes
    articles.value = articleRes
  } catch (error) {
    console.error('首页数据获取失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHomeData()
})

// 路由跳转辅助函数
const navigateTo = (path: string) => {
  router.push(path)
}

// 预警点击跳转 -> /message/detail (可带上具体预警的 id)
const goToWarningDetail = (id?: number) => {
  if (id) {
    router.push(`/message/detail/${id}`) 
  } else {
    router.push('/message/detail')
  }
}

// 文章点击跳转 -> /article/detail
const goToArticleDetail = (id: number) => {
  router.push(`/article/detail/${id}`)
}
</script>

<template>
  <div class="home-container">
    <van-nav-bar title="果康云" fixed placeholder border />

    <van-notice-bar v-if="warnings.length > 0" left-icon="volume-o" :scrollable="false">
      <van-swipe
        vertical
        class="notice-swipe"
        :autoplay="3000"
        :touchable="false"
        :show-indicators="false"
      >
        <van-swipe-item 
          v-for="warning in warnings" 
          :key="warning.id"
          @click="goToWarningDetail(warning.id)"
        >
          【{{ warning.level }}预警】{{ warning.affected_scope }} - 点击查看详情
        </van-swipe-item>
      </van-swipe>
    </van-notice-bar>

    <van-swipe class="banner-swipe" :autoplay="4000" indicator-color="white">
      <van-swipe-item v-for="item in banners" :key="item.id">
        <img :src="item.image" alt="banner" />
        <div class="banner-title">{{ item.title }}</div>
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

    <div class="section-container">
      <div class="section-header">
        <span class="title">热门科普</span>
        <span class="more" @click="navigateTo('/community')">更多文章 <van-icon name="arrow" /></span>
      </div>

      <van-skeleton title avatar :row="3" :loading="loading">
        <div class="article-list">
          <van-card
            v-for="article in articles"
            :key="article.id"
            :desc="article.content"
            :title="article.title"
            thumb="https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg"
            @click="goToArticleDetail(article.id!)"
          >
            <template #tags>
              <van-tag plain type="primary" size="medium">推荐</van-tag>
            </template>
            <template #bottom>
              <div class="article-date">
                发布于 {{ new Date(article.create_at!).toLocaleDateString() }}
              </div>
            </template>
          </van-card>
          
          <van-empty v-if="!loading && articles.length === 0" description="暂无热门文章" />
        </div>
      </van-skeleton>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  /* 去掉 min-height: 100vh 避免底部被撑破 */
  background-color: #f7f8fa;
  padding-bottom: 20px; /* 给最底部留点边距，Tabbar 的高度由 MainLayout 负责 */
}

/* 预警垂直轮播样式 */
.notice-swipe {
  height: 40px;
  line-height: 40px;
}

/* 顶部 Banner 样式 */
.banner-swipe {
  height: 160px;
  margin: 10px 15px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.banner-swipe img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  color: #fff;
  font-size: 14px;
}

/* 快捷菜单区 */
.menu-grid {
  margin: 0 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

/* 热门文章区 */
.section-container {
  margin-top: 15px;
}

.section-header {
  padding: 0 15px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header .title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
}

.section-header .more {
  font-size: 13px;
  color: #969799;
  display: flex;
  align-items: center;
}

.article-list {
  padding: 0 15px;
}

/* 覆盖 Card 样式使其更美观 */
.article-list :deep(.van-card) {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.article-list :deep(.van-card__title) {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 5px;
}

.article-date {
  margin-top: 5px;
  font-size: 12px;
  color: #c8c9cc;
}
</style>