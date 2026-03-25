<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import { Service } from '../api/generated'
import type { PostResponse } from '../api/generated'

// 获取真实后端地址
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const route = useRoute()
const router = useRouter()

const postId = Number(route.params.id)
const postInfo = ref<PostResponse | null>(null)
const loading = ref(true)

// 获取帖子详情 (已使用新接口)
const fetchPostDetail = async () => {
  loading.value = true
  try {
    // 调用直接获取单条帖子的接口
    const res = await Service.readPostApiV1CommunityPostsPostIdGet(postId)

    if (res) {
      postInfo.value = res
    } else {
      showToast('帖子不存在或已被删除')
      router.replace('/community')
    }
  } catch (error) {
    console.error('获取帖子详情失败', error)
    // 后端如果抛出 404 等错误，会进入 catch 分支
    showToast('获取数据失败或帖子不存在')
    router.replace('/community')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (postId) {
    fetchPostDetail()
  } else {
    showToast('参数错误')
    router.replace('/community')
  }
})

// 返回社区页
const onClickLeft = () => {
  router.push('/community')
}

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未知时间'
  return new Date(dateStr).toLocaleString()
}

// 辅助函数：获取完整图片真实地址
const getImageUrl = (url?: string) => {
  if (!url) return 'https://fastly.jsdelivr.net/npm/@vant/assets/tree.jpeg'
  if (url.startsWith('http')) return url
  
  const cleanBase = API_BASE.replace(/\/$/, '')
  const cleanUrl = url.startsWith('/') ? url : `/${url}`
  
  return `${cleanBase}${cleanUrl}`
}

// 预览帖子图片
const previewImage = (index: number) => {
  // 注意：如果实际生成的 PostResponse 中没有 photos 字段，请联系后端加上
  const images = (postInfo.value as any)?.photos || []
  if (images.length > 0) {
    // 映射出完整的真实图片地址数组，供预览组件使用
    const realImageUrls = images.map((url: string) => getImageUrl(url))
    
    showImagePreview({
      images: realImageUrls,
      startPosition: index
    })
  }
}

// 模拟互动功能
const handleLike = () => {
  showToast('点赞成功')
}

const handleComment = () => {
  // 实际项目中可唤起评论输入框或跳转到评论详情
  showToast('唤起评论输入...')
}
</script>

<template>
  <div class="post-detail-container">
    <van-nav-bar 
      title="帖子详情" 
      left-text="返回" 
      left-arrow 
      fixed 
      placeholder 
      border
      safe-area-inset-top @click-left="onClickLeft" 
    />

    <van-skeleton title avatar :row="10" :loading="loading" class="skeleton-wrap">
      <div v-if="postInfo" class="post-body">
        
        <div class="author-header van-hairline--bottom">
          <van-image
            class="avatar"
            round
            width="44"
            height="44"
            src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
          />
          <div class="author-meta">
            <span class="name">果农用户_{{ postInfo.author_id || '匿名' }}</span>
            <span class="time">{{ formatDate(postInfo.create_at) }}</span>
          </div>
          <van-button size="small" type="primary" plain round class="follow-btn">
            关注
          </van-button>
        </div>

        <div class="post-content">
          <h1 class="title">{{ postInfo.title }}</h1>
          <p class="content-text">{{ postInfo.content }}</p>
          
          <div class="photo-grid" v-if="(postInfo as any).photos?.length">
            <van-image
              v-for="(img, index) in (postInfo as any).photos"
              :key="index"
              width="30vw"
              height="30vw"
              fit="cover"
              radius="6"
              :src="getImageUrl(img)"
              class="grid-img"
              @click="previewImage(Number(index))"
            />
          </div>
        </div>

        <van-divider>没有更多内容了</van-divider>

      </div>
    </van-skeleton>

    <van-action-bar v-if="!loading && postInfo" class="custom-action-bar van-hairline--top">
      <div class="comment-input-mock" @click="handleComment">
        <van-icon name="edit" /> 说点什么...
      </div>
      
      <div class="action-icons">
        <div class="icon-item" @click="handleComment">
          <van-icon name="chat-o" size="22" />
          <span class="count">评论</span>
        </div>
        <div class="icon-item" @click="handleLike">
          <van-icon name="good-job-o" size="22" />
          <span class="count">点赞</span>
        </div>
      </div>
    </van-action-bar>

  </div>
</template>

<style scoped>
/* 此处样式与原来一模一样，保持不变 */
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
.grid-img { box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); }
.custom-action-bar { display: flex; align-items: center; padding: 0 16px; justify-content: space-between; box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.02); z-index: 100; }
.comment-input-mock { flex: 1; height: 36px; background-color: #f2f3f5; border-radius: 18px; display: flex; align-items: center; padding: 0 16px; color: #969799; font-size: 14px; gap: 6px; margin-right: 20px; }
.action-icons { display: flex; gap: 20px; }
.icon-item { display: flex; flex-direction: column; align-items: center; color: #646566; }
.icon-item .count { font-size: 10px; margin-top: 2px; }
</style>