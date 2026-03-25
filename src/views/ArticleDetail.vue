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

// 获取文章详情 (已替换为新的单条获取接口)
const fetchArticleDetail = async () => {
  loading.value = true
  try {
    // 调用直接获取单篇文章的接口
    const res = await Service.readArticleApiV1CommunityArticlesArticleIdGet(articleId)
    
    if (res) {
      articleInfo.value = res
    } else {
      showToast('文章不存在或已被删除')
      router.back()
    }
  } catch (error) {
    console.error('获取文章详情失败', error)
    // 后端返回 404/422 等错误时会进入这里
    showToast('获取文章详情失败或文章不存在')
    router.back()
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

// 路由返回（自动返回上一页）
const onClickLeft = () => {
  router.back()
}

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未知时间'
  return new Date(dateStr).toLocaleString()
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
      safe-area-inset-top @click-left="onClickLeft" 
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
        </div>

        <van-divider>完</van-divider>

      </div>
    </van-skeleton>

  </div>
</template>

<style scoped>
/* 样式保持不变 */
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