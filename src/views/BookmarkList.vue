<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { Service } from '../api/generated'
import type { BookmarkItem } from '../api/generated'

const router = useRouter()

// 增强的收藏项结构
interface EnrichedBookmark {
  bookmarkId: number
  target_type: string
  target_id: number
  title: string
  content: string
  author_id: number
  publish_time: string
  created_at: string
}

const bookmarks = ref<EnrichedBookmark[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const detailLoading = ref(false)
let skip = 0
const limit = 20

// 获取标题/作者等增强信息
const enrichBookmarks = async (items: BookmarkItem[]): Promise<EnrichedBookmark[]> => {
  const articleIds = items.filter(i => i.target_type === 'article').map(i => i.target_id)
  const postIds = items.filter(i => i.target_type === 'post').map(i => i.target_id)

  // 并行获取所有文章和帖子详情
  const [articleResults, postResults] = await Promise.all([
    Promise.allSettled(articleIds.map(id => Service.readArticleApiV1CommunityArticlesArticleIdGet(id))),
    Promise.allSettled(postIds.map(id => Service.readPostApiV1CommunityPostsPostIdGet(id)))
  ])

  const articleMap = new Map<number, { title: string; content: string; author_id: number; create_at: string }>()
  articleResults.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      articleMap.set(articleIds[i], {
        title: r.value.title,
        content: r.value.content,
        author_id: r.value.author_id,
        create_at: r.value.create_at
      })
    }
  })

  const postMap = new Map<number, { title: string; content: string; author_id: number; create_at: string }>()
  postResults.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      postMap.set(postIds[i], {
        title: r.value.title,
        content: r.value.content,
        author_id: r.value.author_id,
        create_at: r.value.create_at
      })
    }
  })

  return items.map(item => {
    const detail = item.target_type === 'article'
      ? articleMap.get(item.target_id)
      : postMap.get(item.target_id)
    return {
      bookmarkId: item.id!,
      target_type: item.target_type,
      target_id: item.target_id,
      title: detail?.title ?? '已删除的内容',
      content: detail?.content ?? '',
      author_id: detail?.author_id ?? 0,
      publish_time: detail?.create_at ?? item.created_at ?? '',
      created_at: item.created_at ?? ''
    }
  })
}

const onLoad = async () => {
  if (finished.value) return
  try {
    loading.value = true
    const res = await Service.readMyBookmarksApiV1BookmarkMeGet(undefined, skip, limit)

    const items = res.items
    if (items.length === 0) {
      finished.value = true
      loading.value = false
      return
    }

    // 获取增强信息（标题/作者/发布时间）
    detailLoading.value = true
    const enriched = await enrichBookmarks(items)
    detailLoading.value = false

    if (refreshing.value) {
      bookmarks.value = enriched
      refreshing.value = false
    } else {
      bookmarks.value.push(...enriched)
    }
    skip += limit
    if (items.length < limit) finished.value = true
  } catch (error) {
    console.error('获取收藏列表失败', error)
    showToast('加载失败')
    finished.value = true
  } finally { loading.value = false }
}

const onRefresh = () => {
  finished.value = false
  skip = 0
  refreshing.value = true
  onLoad()
}

const goToDetail = (item: EnrichedBookmark) => {
  if (item.target_type === 'article') {
    router.push(`/article/detail/${item.target_id}`)
  } else if (item.target_type === 'post') {
    router.push(`/post/detail/${item.target_id}`)
  }
}

const removeBookmark = async (item: EnrichedBookmark, index: number) => {
  try {
    await Service.toggleBookmarkApiV1BookmarkTogglePost({
      target_type: item.target_type,
      target_id: item.target_id
    })
    bookmarks.value.splice(index, 1)
    showToast('已取消收藏')
  } catch (error) {
    console.error('取消收藏失败', error)
    showToast('操作失败')
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString()
}

const typeLabel = (t: string) => t === 'article' ? '文章' : '帖子'
</script>

<template>
  <div class="bookmark-container">
    <van-nav-bar title="我的收藏" left-text="返回" left-arrow fixed placeholder safe-area-inset-top @click-left="router.back()" />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多收藏了" @load="onLoad" class="list-wrapper">

        <van-skeleton v-if="detailLoading && refreshing" :row="3" />

        <van-swipe-cell v-for="(item, index) in bookmarks" :key="`${item.target_type}-${item.target_id}`">
          <div class="bookmark-card" @click="goToDetail(item)">
            <div class="card-top">
              <van-tag
                :type="item.target_type === 'article' ? 'primary' : 'success'"
                size="medium"
                plain
                class="type-tag"
              >
                {{ typeLabel(item.target_type) }}
              </van-tag>
              <span class="title">{{ item.title }}</span>
            </div>
            <div class="card-bottom">
              <span class="meta-item">ID: {{ item.target_id }}</span>
              <span class="meta-item">用户_{{ item.author_id }}</span>
              <span class="meta-item">{{ formatDate(item.publish_time) }}</span>
              <van-icon name="arrow" color="#c8c9cc" size="14" />
            </div>
          </div>
          <template #right>
            <van-button square type="danger" text="取消收藏" class="swipe-btn" @click="removeBookmark(item, index)" />
          </template>
        </van-swipe-cell>
      </van-list>
    </van-pull-refresh>

    <van-empty v-if="!loading && bookmarks.length === 0" description="暂无收藏" />
  </div>
</template>

<style scoped>
.bookmark-container { background-color: #f5f6f8; min-height: 100vh; }
.list-wrapper { padding: 12px 16px; }
.bookmark-card {
  background: #fff; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04); cursor: pointer;
  display: flex; flex-direction: column; gap: 8px;
}
.bookmark-card:active { background-color: #f2f3f5; }

/* 第一行：类型标签 + 标题 */
.card-top {
  display: flex; align-items: center; gap: 10px;
}
.type-tag { flex-shrink: 0; }
.title {
  font-size: 15px; font-weight: 600; color: #323233;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  line-height: 1.3;
}

/* 第二行：ID / 用户 / 时间 / 箭头 */
.card-bottom {
  display: flex; align-items: center; gap: 12px;
}
.meta-item {
  font-size: 12px; color: #969799;
}
.card-bottom :deep(.van-icon) {
  margin-left: auto;
}

.swipe-btn { height: 100%; }
</style>
