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

// 点赞状态
const liked = ref(false)
const likeCount = ref(0)
const likeLoading = ref(false)

// 收藏状态
const bookmarked = ref(false)
const bookmarkLoading = ref(false)

// 获取文章详情
const fetchArticleDetail = async () => {
  loading.value = true
  try {
    const res = await Service.readArticleApiV1CommunityArticlesArticleIdGet(articleId)
    if (res) {
      articleInfo.value = res
      // 加载成功后获取点赞和收藏状态
      await Promise.all([fetchLikeStatus(), fetchBookmarkStatus()])
    } else {
      showToast('文章不存在或已被删除')
      router.back()
    }
  } catch (error) {
    console.error('获取文章详情失败', error)
    showToast('获取文章详情失败或文章不存在')
    router.back()
  } finally {
    loading.value = false
  }
}

// 查询点赞状态
const fetchLikeStatus = async () => {
  try {
    const res = await Service.getLikeStatusApiV1LikeStatusGet('article', articleId)
    liked.value = res.liked
    likeCount.value = res.like_count
  } catch (error) {
    console.error('获取点赞状态失败', error)
  }
}

// 查询收藏状态
const fetchBookmarkStatus = async () => {
  try {
    const res = await Service.getBookmarkStatusApiV1BookmarkStatusGet('article', articleId)
    bookmarked.value = res.bookmarked
  } catch (error) {
    console.error('获取收藏状态失败', error)
  }
}

// 切换点赞
const toggleLike = async () => {
  if (likeLoading.value) return
  likeLoading.value = true
  try {
    const res = await Service.toggleLikeApiV1LikeTogglePost({
      target_type: 'article',
      target_id: articleId
    })
    liked.value = res.liked
    likeCount.value = res.like_count
    showToast(res.liked ? '已点赞' : '已取消点赞')
  } catch (error) {
    console.error('点赞操作失败', error)
    showToast('操作失败，请稍后重试')
  } finally {
    likeLoading.value = false
  }
}

// 切换收藏
const toggleBookmark = async () => {
  if (bookmarkLoading.value) return
  bookmarkLoading.value = true
  try {
    const res = await Service.toggleBookmarkApiV1BookmarkTogglePost({
      target_type: 'article',
      target_id: articleId
    })
    bookmarked.value = res.bookmarked
    showToast(res.bookmarked ? '已收藏' : '已取消收藏')
  } catch (error) {
    console.error('收藏操作失败', error)
    showToast('操作失败，请稍后重试')
  } finally {
    bookmarkLoading.value = false
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

const onClickLeft = () => { router.back() }

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
      safe-area-inset-top
      @click-left="onClickLeft"
    />

    <van-skeleton title avatar :row="15" :loading="loading" class="skeleton-wrap">
      <div v-if="articleInfo" class="article-body">
        <div class="article-header">
          <h1 class="title">{{ articleInfo.title }}</h1>
          <div class="author-info">
            <van-image class="avatar" round width="40" height="40"
              src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
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

    <!-- 底部操作栏 -->
    <van-action-bar v-if="!loading && articleInfo" :safe-area-inset-bottom="true">
      <van-action-bar-icon
        :icon="liked ? 'good-job' : 'good-job-o'"
        :text="likeCount > 0 ? String(likeCount) : '点赞'"
        :color="liked ? '#ee0a24' : undefined"
        @click="toggleLike"
      />
      <van-action-bar-icon
        :icon="bookmarked ? 'star' : 'star-o'"
        :text="bookmarked ? '已收藏' : '收藏'"
        :color="bookmarked ? '#ff976a' : undefined"
        @click="toggleBookmark"
      />
      <van-action-bar-icon icon="share-o" text="分享" />
    </van-action-bar>
  </div>
</template>

<style scoped>
.article-detail-container {
  background-color: #fff;
  min-height: 100vh;
  padding-bottom: 60px;
}
.skeleton-wrap { margin-top: 20px; }
.article-body { padding: 20px 16px; }
.article-header .title {
  margin: 0 0 16px 0;
  font-size: 22px;
  font-weight: bold;
  color: #323233;
  line-height: 1.4;
}
.author-info { display: flex; align-items: center; gap: 12px; }
.meta { display: flex; flex-direction: column; }
.author-name {
  font-size: 15px; color: #323233; font-weight: 500;
  display: flex; align-items: center; gap: 6px;
}
.publish-time { font-size: 12px; color: #969799; margin-top: 4px; }
.article-content {
  font-size: 16px; color: #333; line-height: 1.8; word-wrap: break-word;
}
.article-content p { white-space: pre-wrap; margin-bottom: 1em; }
.article-img { margin: 10px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
</style>
