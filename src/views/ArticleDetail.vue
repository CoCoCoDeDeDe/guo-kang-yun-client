<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { Service } from '../api/generated'
import type { ArticleResponse } from '../api/generated'

const route = useRoute()
const router = useRouter()

const articleId = Number(route.params.id)
const articleInfo = ref<ArticleResponse | null>(null)
const loading = ref(true)

// 获取文章详情
const fetchArticleDetail = async () => {
  loading.value = true
  try {
    // 【注意】当前 API 没有获取单篇文章的接口，这里拉取前 100 条并在前端进行匹配
    // 如果后端添加了接口，请替换为直接获取详情的方法
    const res = await Service.readArticlesApiV1CommunityArticlesGet(0, 100)
    const foundArticle = res.find(item => item.id === articleId)

    if (foundArticle) {
      articleInfo.value = foundArticle
    } else {
      showToast('文章不存在或已被删除')
      router.back()
    }
  } catch (error) {
    console.error('获取文章详情失败', error)
    showToast('获取文章详情失败，请检查网络')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (articleId) {
    fetchArticleDetail()
  } else {
    showToast('文章参数错误')
    router.back()
  }
})

// 路由返回（自动返回首页或社区）
const onClickLeft = () => {
  router.back()
}

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未知时间'
  return new Date(dateStr).toLocaleString()
}

// 模拟互动功能
const handleLike = () => {
  showToast('点赞成功')
}

const handleCollect = () => {
  showToast('已收藏')
}
</script>

<template>
  <div class="article-detail-container">
    <van-nav-bar 
      title="文章详情" 
      left-text="返回" 
      left-arrow 
      fixed 
      placeholder 
      @click-left="onClickLeft" 
    />

    <van-skeleton title avatar :row="15" :loading="loading" class="skeleton-wrap">
      <div v-if="articleInfo" class="article-body">
        
        <div class="article-header">
          <h1 class="title">{{ articleInfo.title }}</h1>
          
          <div class="author-info">
            <van-image
              class="avatar"
              round
              width="40"
              height="40"
              src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
            />
            <div class="meta">
              <span class="author-name">
                果康云专家平台 <van-tag type="primary" size="medium" plain>官方认证</van-tag>
              </span>
              <span class="publish-time">{{ formatDate(articleInfo.create_at) }}</span>
            </div>
          </div>
        </div>

        <van-divider />

        <div class="article-content">
          <p>{{ articleInfo.content }}</p>
          
          <van-image
            class="article-img"
            width="100%"
            radius="8"
            src="https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg"
          />
        </div>

        <van-divider>完</van-divider>

      </div>
    </van-skeleton>

    <van-action-bar v-if="!loading && articleInfo" class="custom-action-bar">
      <van-action-bar-icon icon="chat-o" text="评论" @click="showToast('评论功能开发中')" />
      <van-action-bar-icon icon="good-job-o" text="点赞" @click="handleLike" />
      <van-action-bar-icon icon="star-o" text="收藏" @click="handleCollect" />
      <van-action-bar-icon icon="share-o" text="分享" @click="showToast('分享功能开发中')" />
    </van-action-bar>

  </div>
</template>

<style scoped>
.article-detail-container {
  background-color: #fff;
  min-height: 100vh;
  /* 留出底部 ActionBar 的空间 */
  padding-bottom: 60px; 
}

.skeleton-wrap {
  margin-top: 20px;
}

.article-body {
  padding: 20px 16px;
}

/* 标题和作者区域 */
.article-header .title {
  margin: 0 0 16px 0;
  font-size: 22px;
  font-weight: bold;
  color: #323233;
  line-height: 1.4;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 15px;
  color: #323233;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.publish-time {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}

/* 正文样式 */
.article-content {
  font-size: 16px;
  color: #333;
  line-height: 1.8;
  word-wrap: break-word;
}

/* 保护后端可能传过来的换行符 */
.article-content p {
  white-space: pre-wrap; 
  margin-bottom: 1em;
}

.article-img {
  margin: 10px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 自定义底部 ActionBar */
.custom-action-bar {
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  justify-content: space-around;
}

.custom-action-bar :deep(.van-action-bar-icon) {
  /* 去掉默认按钮的弹性伸缩，均匀分布 */
  flex: none;
  min-width: 60px;
}
</style>