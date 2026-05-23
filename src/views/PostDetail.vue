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

// 点赞状态
const liked = ref(false)
const likeCount = ref(0)
const likeLoading = ref(false)

// 收藏状态
const bookmarked = ref(false)
const bookmarkLoading = ref(false)

// 获取帖子详情
const fetchPostDetail = async () => {
  loading.value = true
  try {
    const res = await Service.readPostApiV1CommunityPostsPostIdGet(postId)
    if (res) {
      postInfo.value = res
      await Promise.all([fetchLikeStatus(), fetchBookmarkStatus()])
    } else {
      showToast('帖子不存在或已被删除')
      router.replace('/community')
    }
  } catch (error) {
    console.error('获取帖子详情失败', error)
    showToast('获取数据失败或帖子不存在')
    router.replace('/community')
  } finally {
    loading.value = false
  }
}

const fetchLikeStatus = async () => {
  try {
    const res = await Service.getLikeStatusApiV1LikeStatusGet('post', postId)
    liked.value = res.liked
    likeCount.value = res.like_count
  } catch (error) { console.error('获取点赞状态失败', error) }
}

const fetchBookmarkStatus = async () => {
  try {
    const res = await Service.getBookmarkStatusApiV1BookmarkStatusGet('post', postId)
    bookmarked.value = res.bookmarked
  } catch (error) { console.error('获取收藏状态失败', error) }
}

const toggleLike = async () => {
  if (likeLoading.value) return
  likeLoading.value = true
  try {
    const res = await Service.toggleLikeApiV1LikeTogglePost({ target_type: 'post', target_id: postId })
    liked.value = res.liked
    likeCount.value = res.like_count
    showToast(res.liked ? '已点赞' : '已取消点赞')
  } catch (error) {
    console.error('点赞操作失败', error)
    showToast('操作失败')
  } finally { likeLoading.value = false }
}

const toggleBookmark = async () => {
  if (bookmarkLoading.value) return
  bookmarkLoading.value = true
  try {
    const res = await Service.toggleBookmarkApiV1BookmarkTogglePost({ target_type: 'post', target_id: postId })
    bookmarked.value = res.bookmarked
    showToast(res.bookmarked ? '已收藏' : '已取消收藏')
  } catch (error) {
    console.error('收藏操作失败', error)
    showToast('操作失败')
  } finally { bookmarkLoading.value = false }
}

onMounted(() => {
  if (postId) { fetchPostDetail() }
  else { showToast('参数错误'); router.replace('/community') }
})

const onClickLeft = () => { router.push('/community') }

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未知时间'
  return new Date(dateStr).toLocaleString()
}

const getImageUrl = (url?: string) => {
  if (!url) return 'https://fastly.jsdelivr.net/npm/@vant/assets/tree.jpeg'
  if (url.startsWith('http')) return url
  const cleanBase = API_BASE.replace(/\/$/, '')
  const cleanUrl = url.startsWith('/') ? url : `/${url}`
  return `${cleanBase}${cleanUrl}`
}

const previewImage = (index: number) => {
  const images = (postInfo.value as any)?.photos || []
  if (images.length > 0) {
    const realImageUrls = images.map((url: string) => getImageUrl(url))
    showImagePreview({ images: realImageUrls, startPosition: index })
  }
}
</script>

<template>
  <div class="post-detail-container">
    <van-nav-bar title="帖子详情" left-text="返回" left-arrow fixed placeholder border safe-area-inset-top @click-left="onClickLeft" />

    <van-skeleton title avatar :row="10" :loading="loading" class="skeleton-wrap">
      <div v-if="postInfo" class="post-body">
        <div class="author-header van-hairline--bottom">
          <van-image class="avatar" round width="44" height="44"
            src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
          <div class="author-meta">
            <span class="name">果农用户_{{ postInfo.author_id || '匿名' }}</span>
            <span class="time">{{ formatDate(postInfo.create_at) }}</span>
          </div>
          <van-button size="small" type="primary" plain round class="follow-btn">关注</van-button>
        </div>

        <div class="post-content">
          <h1 class="title">{{ postInfo.title }}</h1>
          <p class="content-text">{{ postInfo.content }}</p>
          <div class="photo-grid" v-if="(postInfo as any).photos?.length">
            <van-image v-for="(img, index) in (postInfo as any).photos" :key="index"
              width="30vw" height="30vw" fit="cover" radius="6"
              :src="getImageUrl(img)" class="grid-img"
              @click="previewImage(Number(index))" />
          </div>
        </div>

        <van-divider>没有更多内容了</van-divider>
      </div>
    </van-skeleton>

    <!-- 底部操作栏 -->
    <van-action-bar v-if="!loading && postInfo" :safe-area-inset-bottom="true">
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
      <van-action-bar-icon icon="chat-o" text="评论" badge="0" />
      <van-action-bar-icon icon="share-o" text="分享" />
    </van-action-bar>
  </div>
</template>

<style scoped>
.post-detail-container { background-color: #fff; min-height: 100vh; padding-bottom: 60px; }
.skeleton-wrap { margin-top: 20px; }
.author-header { display: flex; align-items: center; padding: 16px; background-color: #fff; }
.author-meta { flex: 1; margin-left: 12px; display: flex; flex-direction: column; }
.author-meta .name { font-size: 15px; font-weight: bold; color: #323233; }
.author-meta .time { font-size: 12px; color: #969799; margin-top: 4px; }
.follow-btn { height: 28px; padding: 0 12px; }
.post-content { padding: 16px; }
.post-content .title { margin: 0 0 12px 0; font-size: 20px; font-weight: bold; color: #323233; line-height: 1.4; }
.content-text { font-size: 16px; color: #333; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word; margin-bottom: 16px; }
.photo-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.grid-img { box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
</style>
