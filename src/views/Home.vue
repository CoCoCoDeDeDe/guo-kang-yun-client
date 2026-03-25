<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Service } from '../api/generated'
import type { WarningMessageResponse, ArticleResponse } from '../api/generated'

const router = useRouter()

const warnings = ref<WarningMessageResponse[]>([])
const articles = ref<ArticleResponse[]>([])
const loading = ref(false)

// 菜单配置：增加背景色以美化图标
const menuItems = [
  { icon: 'apps-o', text: '病虫百科', path: '/encyclopedia', color: '#07c160', bgColor: '#e8f7ed' },
  { icon: 'edit', text: '治理填报', path: '/record/form', color: '#1989fa', bgColor: '#e8f2ff' },
  { icon: 'orders-o', text: '我的记录', path: '/record/list', color: '#7232dd', bgColor: '#f1ecf9' },
  { icon: 'warn-o', text: '预警列表', path: '/message/list', color: '#ee0a24', bgColor: '#ffeaeb' },
  { icon: 'friends-o', text: '互动社区', path: '/community', color: '#ff976a', bgColor: '#fff4eb' },
  { icon: 'add-square', text: '发帖求助', path: '/post/create', color: '#00b96b', bgColor: '#e6f8f0' },
  { icon: 'setting-o', text: '编辑资料', path: '/profile/edit', color: '#39a9ed', bgColor: '#ebf6fd' },
  { icon: 'contact', text: '个人中心', path: '/profile', color: '#969799', bgColor: '#f5f5f5' }
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
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchHomeData())

const navigateTo = (path: string) => router.push(path)
const goToWarningDetail = (id?: number) => router.push(id ? `/message/detail/${id}` : '/message/list')
const goToArticleDetail = (id: number) => router.push(`/article/detail/${id}`)
</script>

<template>
  <div class="home-container">
    <van-nav-bar title="果康云" fixed placeholder border safe-area-inset-top />

    <div class="notice-wrapper" v-if="warnings.length > 0">
      <van-notice-bar :scrollable="false" class="custom-notice-bar">
        <template #left-icon>
          <van-icon name="warning" color="#ee0a24" size="18" style="margin-right: 8px" />
        </template>
        <van-swipe vertical class="notice-swipe" :autoplay="3000" :touchable="false" :show-indicators="false">
          <van-swipe-item v-for="warning in warnings" :key="warning.id" @click="goToWarningDetail(warning.id)">
            <span class="warning-tag" :class="warning.level">[{{ warning.level }}]</span>
            {{ warning.affected_scope }}
          </van-swipe-item>
        </van-swipe>
      </van-notice-bar>
    </div>

    <div class="menu-card">
      <van-grid :column-num="4" :border="false">
        <van-grid-item v-for="item in menuItems" :key="item.text" @click="navigateTo(item.path)">
          <template #icon>
            <div class="icon-box" :style="{ backgroundColor: item.bgColor }">
              <van-icon :name="item.icon" :color="item.color" size="24" />
            </div>
          </template>
          <template #text>
            <span class="menu-text">{{ item.text }}</span>
          </template>
        </van-grid-item>
      </van-grid>
    </div>

    <div class="section-container">
      <div class="section-header">
        <h3 class="title">热门科普</h3>
        <div class="more" @click="navigateTo('/community')">
          全部文章 <van-icon name="arrow" />
        </div>
      </div>

      <van-skeleton title :row="5" :loading="loading" class="custom-skeleton">
        <div class="article-list">
          <div 
            class="text-article-card" 
            v-for="article in articles" 
            :key="article.id"
            @click="goToArticleDetail(article.id!)"
          >
            <div class="card-header">
              <van-tag type="primary" plain round class="cat-tag">{{ article.category }}</van-tag>
              <span class="view-count"><van-icon name="eye-o" /> {{ article.views || 0 }}</span>
            </div>
            <h4 class="article-title van-ellipsis">{{ article.title }}</h4>
            <p class="article-desc van-multi-ellipsis--l2">{{ article.content }}</p>
            <div class="card-footer">
              <span>果康云官方</span>
              <span class="dot">·</span>
              <span>{{ new Date(article.create_at!).toLocaleDateString() }}</span>
            </div>
          </div>
          
          <van-empty v-if="!loading && articles.length === 0" description="暂无热门文章" />
        </div>
      </van-skeleton>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  background-color: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 30px;
}

/* 预警样式 */
.notice-wrapper {
  padding: 12px 16px 0;
}
.custom-notice-bar {
  border-radius: 20px;
  height: 40px;
  background-color: #fff;
  color: #323233;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.notice-swipe {
  height: 40px;
  line-height: 40px;
  font-size: 13px;
}
.warning-tag {
  font-weight: bold;
  margin-right: 4px;
}
.warning-tag.高 { color: #ee0a24; }
.warning-tag.中 { color: #ff976a; }

/* 菜单金刚区 */
.menu-card {
  margin: 16px;
  background: #fff;
  border-radius: 16px;
  padding: 8px 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}
.menu-text {
  font-size: 12px;
  color: #323233;
  font-weight: 500;
}

/* 列表部分 */
.section-container {
  margin-top: 20px;
}
.section-header {
  padding: 0 20px 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.section-header .title {
  font-size: 18px;
  margin: 0;
  color: #1a1a1a;
}
.section-header .more {
  font-size: 13px;
  color: #1989fa;
}

.article-list {
  padding: 0 16px;
}

/* 纯文字卡片设计 */
.text-article-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  transition: background 0.2s;
}
.text-article-card:active {
  background: #f2f3f5;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.cat-tag {
  font-weight: 500;
}
.view-count {
  font-size: 12px;
  color: #969799;
}
.article-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #323233;
  line-height: 1.4;
}
.article-desc {
  font-size: 13px;
  color: #646566;
  line-height: 1.6;
  margin-bottom: 12px;
}
.card-footer {
  font-size: 12px;
  color: #c8c9cc;
  display: flex;
  align-items: center;
}
.card-footer .dot {
  margin: 0 6px;
}

.custom-skeleton {
  padding: 20px;
}
</style>