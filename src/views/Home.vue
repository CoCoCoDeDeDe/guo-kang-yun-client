<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Service } from '../api/generated'
import type { WarningMessageResponse, ArticleResponse } from '../api/generated'

const router = useRouter()

const warnings = ref<WarningMessageResponse[]>([])
const articles = ref<ArticleResponse[]>([])
const loading = ref(false)

const menuItems = [
  { icon: 'apps-o', text: '病虫百科', path: '/encyclopedia', color: '#10b981', bg: '#d1fae5' },
  { icon: 'edit', text: '治理填报', path: '/record/form', color: '#3b82f6', bg: '#dbeafe' },
  { icon: 'orders-o', text: '我的记录', path: '/record/list', color: '#8b5cf6', bg: '#ede9fe' },
  { icon: 'warn-o', text: '预警列表', path: '/message/list', color: '#ef4444', bg: '#fee2e2' },
  { icon: 'friends-o', text: '互动社区', path: '/community', color: '#f97316', bg: '#ffedd5' },
  { icon: 'add-square', text: '发帖求助', path: '/post/create', color: '#0d9488', bg: '#ccfbf1' },
  { icon: 'chart-trending-o', text: '数据统计', path: '/statistics', color: '#6366f1', bg: '#e0e7ff' },
  { icon: 'star-o', text: '我的收藏', path: '/bookmarks', color: '#f59e0b', bg: '#fef3c7' },
]

const fetchHomeData = async () => {
  loading.value = true
  try {
    const [warningRes, articleRes] = await Promise.all([
      Service.readActiveWarningsApiV1WarningActiveGet(0, 5),
      Service.readArticlesApiV1CommunityArticlesGet(0, 10)
    ])
    warnings.value = warningRes
    articles.value = articleRes
  } catch (error) {
    console.error('首页数据获取失败', error)
  } finally { loading.value = false }
}

onMounted(() => fetchHomeData())

const navigateTo = (path: string) => router.push(path)
const goToWarningDetail = (id?: number) => router.push(id ? `/message/detail/${id}` : '/message/list')
const goToArticleDetail = (id: number) => router.push(`/article/detail/${id}`)
</script>

<template>
  <div class="home-container">
    <van-nav-bar title="果康云" fixed placeholder safe-area-inset-top />

    <!-- Banner 渐变头部 -->
    <div class="hero-banner">
      <div class="hero-content">
        <h1 class="hero-title">智慧果园管理</h1>
        <p class="hero-desc">病虫害识别 · 治理记录 · 专家预警</p>
      </div>
      <div class="hero-decoration">
        <div class="hero-dot dot-1"></div>
        <div class="hero-dot dot-2"></div>
        <div class="hero-dot dot-3"></div>
      </div>
    </div>

    <!-- 预警滚动 -->
    <div class="notice-wrapper" v-if="warnings.length > 0">
      <van-notice-bar :scrollable="false">
        <template #left-icon>
          <van-icon name="warning" color="#ef4444" size="16" style="margin-right:8px" />
        </template>
        <van-swipe vertical class="notice-swipe" :autoplay="3000" :touchable="false" :show-indicators="false">
          <van-swipe-item v-for="w in warnings" :key="w.id" @click="goToWarningDetail(w.id)">
            <span class="warning-tag">[{{ w.level }}]</span> {{ w.affected_scope }}
          </van-swipe-item>
        </van-swipe>
      </van-notice-bar>
    </div>

    <!-- 功能网格 -->
    <div class="menu-grid">
      <div
        v-for="item in menuItems"
        :key="item.text"
        class="menu-item"
        @click="navigateTo(item.path)"
      >
        <div class="menu-icon" :style="{ background: item.bg }">
          <van-icon :name="item.icon" :color="item.color" size="22" />
        </div>
        <span class="menu-text">{{ item.text }}</span>
      </div>
    </div>

    <!-- 热门文章 -->
    <div class="section-wrap">
      <div class="section-header">
        <h3 class="section-title">🔥 热门科普</h3>
        <span class="section-more" @click="navigateTo('/community')">全部 <van-icon name="arrow" /></span>
      </div>

      <van-skeleton title :row="4" :loading="loading">
        <div class="article-list">
          <div
            v-for="article in articles"
            :key="article.id"
            class="article-card"
            @click="goToArticleDetail(article.id!)"
          >
            <div class="ac-top">
              <van-tag type="primary" plain round size="small">{{ article.category }}</van-tag>
              <span class="ac-views"><van-icon name="eye-o" size="12" /> {{ article.views || 0 }}</span>
            </div>
            <h4 class="ac-title">{{ article.title }}</h4>
            <p class="ac-desc">{{ article.content }}</p>
            <div class="ac-footer">
              <span>果康云官方</span>
              <span class="ac-dot">·</span>
              <span>{{ new Date(article.create_at!).toLocaleDateString() }}</span>
            </div>
          </div>
          <van-empty v-if="!loading && articles.length === 0" description="暂无文章" />
        </div>
      </van-skeleton>
    </div>
  </div>
</template>

<style scoped>
.home-container { background: var(--color-bg); min-height: 100vh; padding-bottom: 30px; }

/* 渐变头部 */
.hero-banner {
  margin: 12px 16px 0;
  background: linear-gradient(135deg, #10b981 0%, #0d9488 50%, #6366f1 100%);
  border-radius: 20px;
  padding: 28px 22px;
  position: relative;
  overflow: hidden;
}
.hero-title { font-size: 22px; font-weight: 700; color: #fff; margin: 0 0 6px; letter-spacing: -.02em; }
.hero-desc { font-size: 13px; color: rgba(255,255,255,.75); margin: 0; }
.hero-decoration { position: absolute; right: -20px; top: 50%; transform: translateY(-50%); }
.hero-dot {
  width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,.08);
  position: absolute;
}
.dot-1 { right: 0; top: -40px; width: 100px; height: 100px; }
.dot-2 { right: 40px; top: -10px; width: 60px; height: 60px; }
.dot-3 { right: -20px; bottom: -30px; width: 70px; height: 70px; }

/* 预警 */
.notice-wrapper { padding: 12px 16px 0; }
.van-notice-bar { border-radius: 14px; height: 40px; background: #fff; box-shadow: var(--shadow-sm); }
.notice-swipe { height: 40px; line-height: 40px; font-size: 13px; }
.warning-tag { font-weight: 700; color: #ef4444; margin-right: 4px; }

/* 功能网格 */
.menu-grid {
  margin: 16px;
  background: #fff;
  border-radius: 20px;
  padding: 20px 8px 12px;
  box-shadow: var(--shadow-sm);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}
.menu-item {
  display: flex; flex-direction: column; align-items: center;
  padding: 10px 4px; cursor: pointer; border-radius: 14px;
  transition: background var(--transition-fast);
}
.menu-item:active { background: #f8fafc; }
.menu-icon {
  width: 46px; height: 46px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px; transition: transform var(--transition-fast);
}
.menu-item:active .menu-icon { transform: scale(.92); }
.menu-text { font-size: 12px; color: var(--color-text-primary); font-weight: 500; }

/* 文章列表 */
.section-wrap { margin-top: 8px; }
.section-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 20px 12px;
}
.section-title { font-size: 18px; font-weight: 700; margin: 0; color: var(--color-text-primary); }
.section-more { font-size: 13px; color: var(--color-primary); cursor: pointer; }
.article-list { padding: 0 16px; }

.article-card {
  background: #fff; border-radius: 16px; padding: 16px; margin-bottom: 12px;
  box-shadow: var(--shadow-sm); transition: all var(--transition-fast);
}
.article-card:active { transform: scale(.985); box-shadow: var(--shadow-md); }
.ac-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.ac-views { font-size: 12px; color: var(--color-text-muted); display: flex; align-items: center; gap: 4px; }
.ac-title {
  font-size: 16px; font-weight: 600; color: var(--color-text-primary);
  margin: 0 0 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ac-desc {
  font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; margin: 0 0 10px;
}
.ac-footer { font-size: 12px; color: var(--color-text-muted); }
.ac-dot { margin: 0 6px; }
</style>
