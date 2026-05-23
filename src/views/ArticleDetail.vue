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

const liked = ref(false)
const likeCount = ref(0)
const likeLoading = ref(false)

const bookmarked = ref(false)
const bookmarkLoading = ref(false)

const fetchArticleDetail = async () => {
  loading.value = true
  try {
    const res = await Service.readArticleApiV1CommunityArticlesArticleIdGet(articleId)
    if (res) {
      articleInfo.value = res
      await Promise.all([fetchLikeStatus(), fetchBookmarkStatus()])
    } else { showToast('文章不存在或已被删除'); router.back() }
  } catch (e) { showToast('获取文章详情失败'); router.back() }
  finally { loading.value = false }
}

const fetchLikeStatus = async () => {
  try {
    const r = await Service.getLikeStatusApiV1LikeStatusGet('article', articleId)
    liked.value = r.liked; likeCount.value = r.like_count
  } catch (e) { console.error(e) }
}

const fetchBookmarkStatus = async () => {
  try {
    const r = await Service.getBookmarkStatusApiV1BookmarkStatusGet('article', articleId)
    bookmarked.value = r.bookmarked
  } catch (e) { console.error(e) }
}

const toggleLike = async () => {
  if (likeLoading.value) return
  likeLoading.value = true
  try {
    const r = await Service.toggleLikeApiV1LikeTogglePost({ target_type: 'article', target_id: articleId })
    liked.value = r.liked; likeCount.value = r.like_count
  } catch (e) { console.error(e) }
  finally { likeLoading.value = false }
}

const toggleBookmark = async () => {
  if (bookmarkLoading.value) return
  bookmarkLoading.value = true
  try {
    const r = await Service.toggleBookmarkApiV1BookmarkTogglePost({ target_type: 'article', target_id: articleId })
    bookmarked.value = r.bookmarked
  } catch (e) { console.error(e) }
  finally { bookmarkLoading.value = false }
}

onMounted(() => {
  if (articleId) fetchArticleDetail()
  else { showToast('文章参数错误'); router.back() }
})

const onClickLeft = () => router.back()
const formatDate = (d?: string) => d ? new Date(d).toLocaleString() : '未知时间'
</script>

<template>
  <div class="article-detail-container">
    <van-nav-bar title="文章详情" left-text="返回" left-arrow fixed placeholder safe-area-inset-top @click-left="onClickLeft" />

    <van-skeleton title avatar :row="15" :loading="loading" class="skeleton-wrap">
      <div v-if="articleInfo" class="article-body">
        <div class="article-header">
          <h1 class="title">{{ articleInfo.title }}</h1>
          <div class="author-info">
            <van-image class="avatar" round width="40" height="40" src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
            <div class="meta">
              <span class="author-name">果康云专家平台 <van-tag type="primary" size="medium" plain>官方认证</van-tag></span>
              <span class="publish-time">{{ formatDate(articleInfo.create_at) }}</span>
            </div>
          </div>
        </div>
        <van-divider />
        <div class="article-content"><p>{{ articleInfo.content }}</p></div>
        <van-divider>完</van-divider>
      </div>
    </van-skeleton>

    <!-- 底部操作栏（仅点赞+收藏） -->
    <div v-if="!loading && articleInfo" class="bottom-bar">
      <div class="bb-btn" :class="{ active: liked }" @click="toggleLike">
        <van-icon :name="liked ? 'good-job' : 'good-job-o'" size="22" />
        <span>{{ likeCount > 0 ? likeCount : '点赞' }}</span>
      </div>
      <div class="bb-divider"></div>
      <div class="bb-btn" :class="{ active: bookmarked }" @click="toggleBookmark">
        <van-icon :name="bookmarked ? 'star' : 'star-o'" size="22" />
        <span>{{ bookmarked ? '已收藏' : '收藏' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-detail-container { background: var(--color-bg); min-height: 100vh; padding-bottom: 80px; }
.skeleton-wrap { margin-top: 20px; }
.article-body { padding: 20px 16px; background: #fff; min-height: 60vh; }
.article-header .title { margin: 0 0 16px; font-size: 22px; font-weight: 700; color: var(--color-text-primary); line-height: 1.4; }
.author-info { display: flex; align-items: center; gap: 12px; }
.meta { display: flex; flex-direction: column; }
.author-name { font-size: 15px; color: var(--color-text-primary); font-weight: 500; display: flex; align-items: center; gap: 6px; }
.publish-time { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }
.article-content { font-size: 16px; color: var(--color-text-secondary); line-height: 1.8; word-wrap: break-word; }
.article-content p { white-space: pre-wrap; margin-bottom: 1em; }

.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,.94); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--color-border-light);
  padding: 10px 0 env(safe-area-inset-bottom, 10px);
}
.bb-btn {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 8px 40px; cursor: pointer; transition: all var(--transition-fast);
  color: var(--color-text-muted); font-size: 12px; font-weight: 500;
  border-radius: 12px; user-select: none;
}
.bb-btn:active { background: var(--color-border-light); transform: scale(.95); }
.bb-btn.active { color: #ef4444; }
.bb-divider { width: 1px; height: 28px; background: var(--color-border); border-radius: 1px; }
</style>
