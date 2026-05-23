<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import { Service } from '../api/generated'
import type { PostResponse } from '../api/generated'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const route = useRoute()
const router = useRouter()

const postId = Number(route.params.id)
const postInfo = ref<PostResponse | null>(null)
const loading = ref(true)

const liked = ref(false)
const likeCount = ref(0)
const likeLoading = ref(false)

const bookmarked = ref(false)
const bookmarkLoading = ref(false)

const fetchPostDetail = async () => {
  loading.value = true
  try {
    const res = await Service.readPostApiV1CommunityPostsPostIdGet(postId)
    if (res) { postInfo.value = res; await Promise.all([fetchLikeStatus(), fetchBookmarkStatus()]) }
    else { showToast('帖子不存在'); router.replace('/community') }
  } catch (e) { showToast('获取失败'); router.replace('/community') }
  finally { loading.value = false }
}

const fetchLikeStatus = async () => {
  try { const r = await Service.getLikeStatusApiV1LikeStatusGet('post', postId); liked.value = r.liked; likeCount.value = r.like_count } catch (e) {}
}

const fetchBookmarkStatus = async () => {
  try { const r = await Service.getBookmarkStatusApiV1BookmarkStatusGet('post', postId); bookmarked.value = r.bookmarked } catch (e) {}
}

const toggleLike = async () => {
  if (likeLoading.value) return; likeLoading.value = true
  try { const r = await Service.toggleLikeApiV1LikeTogglePost({ target_type: 'post', target_id: postId }); liked.value = r.liked; likeCount.value = r.like_count } catch (e) {}
  finally { likeLoading.value = false }
}

const toggleBookmark = async () => {
  if (bookmarkLoading.value) return; bookmarkLoading.value = true
  try { const r = await Service.toggleBookmarkApiV1BookmarkTogglePost({ target_type: 'post', target_id: postId }); bookmarked.value = r.bookmarked } catch (e) {}
  finally { bookmarkLoading.value = false }
}

onMounted(() => { postId ? fetchPostDetail() : (showToast('参数错误'), router.replace('/community')) })

const onClickLeft = () => router.push('/community')
const formatDate = (d?: string) => d ? new Date(d).toLocaleString() : '未知时间'
const getImageUrl = (url?: string) => {
  if (!url) return 'https://fastly.jsdelivr.net/npm/@vant/assets/tree.jpeg'
  if (url.startsWith('http')) return url
  const b = API_BASE.replace(/\/$/, ''), u = url.startsWith('/') ? url : `/${url}`
  return `${b}${u}`
}
const previewImage = (idx: number) => {
  const imgs = (postInfo.value as any)?.photos || []
  if (imgs.length) showImagePreview({ images: imgs.map(getImageUrl), startPosition: idx })
}
</script>

<template>
  <div class="post-detail-container">
    <van-nav-bar title="帖子详情" left-text="返回" left-arrow fixed placeholder safe-area-inset-top @click-left="onClickLeft" />

    <van-skeleton title avatar :row="10" :loading="loading" class="skeleton-wrap">
      <div v-if="postInfo" class="post-body">
        <div class="author-header">
          <van-image class="avatar" round width="44" height="44" src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
          <div class="author-meta">
            <span class="name">果农用户_{{ postInfo.author_id || '匿名' }}</span>
            <span class="time">{{ formatDate(postInfo.create_at) }}</span>
          </div>
        </div>
        <div class="post-content">
          <h1 class="title">{{ postInfo.title }}</h1>
          <p class="content-text">{{ postInfo.content }}</p>
          <div class="photo-grid" v-if="(postInfo as any).photos?.length">
            <van-image v-for="(img, idx) in (postInfo as any).photos" :key="idx"
              width="30vw" height="30vw" fit="cover" radius="8"
              :src="getImageUrl(img)" class="grid-img" @click="previewImage(Number(idx))" />
          </div>
        </div>
        <van-divider>没有更多内容了</van-divider>
      </div>
    </van-skeleton>

    <!-- 底部操作栏（仅点赞+收藏） -->
    <div v-if="!loading && postInfo" class="bottom-bar">
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
.post-detail-container { background: var(--color-bg); min-height: 100vh; padding-bottom: 80px; }
.skeleton-wrap { margin-top: 20px; }
.author-header { display: flex; align-items: center; padding: 16px; background: #fff; }
.author-meta { flex: 1; margin-left: 12px; display: flex; flex-direction: column; }
.name { font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
.time { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }
.post-content { background: #fff; padding: 0 16px 16px; }
.title { margin: 0 0 12px; font-size: 20px; font-weight: 700; color: var(--color-text-primary); line-height: 1.4; }
.content-text { font-size: 16px; color: var(--color-text-secondary); line-height: 1.7; white-space: pre-wrap; word-wrap: break-word; margin-bottom: 16px; }
.photo-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.grid-img { box-shadow: 0 2px 8px rgba(0,0,0,.06); }

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
