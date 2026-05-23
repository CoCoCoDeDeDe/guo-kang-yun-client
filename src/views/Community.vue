<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Service } from '../api/generated'
import type { ArticleResponse, PostResponse, UserResponse } from '../api/generated'

const router = useRouter()

// 当前激活的标签
const activeTab = ref('articles')

// ================= 0. 用户信息与权限逻辑 =================
const userInfo = ref<UserResponse | null>(null)

const fetchUserInfo = async () => {
  try {
    const res = await Service.readUsersMeApiV1UsersMeGet()
    userInfo.value = res
  } catch (error) { console.error('获取用户信息失败', error) }
}

onMounted(() => { fetchUserInfo() })

const canPublishArticle = computed(() => {
  if (!userInfo.value || userInfo.value.role === undefined) return false
  return Number(userInfo.value.role) !== 0
})

const showFab = computed(() => {
  if (activeTab.value === 'posts') return true
  if (activeTab.value === 'articles') return canPublishArticle.value
  return false
})

const fabConfig = computed(() => {
  if (activeTab.value === 'articles') return { color: '#1989fa', shadow: 'rgba(25,137,250,0.4)', handler: goToAdminPublishArticle }
  return { color: '#07c160', shadow: 'rgba(7,193,96,0.4)', handler: goToCreatePost }
})

// ================= 1. 文章专栏 =================
const articles = ref<ArticleResponse[]>([])
const articleLoading = ref(false)
const articleFinished = ref(false)
const articleRefreshing = ref(false)
let articleSkip = 0
const articleLimit = 10

// 点赞与收藏状态集合
const likedArticleIds = ref<Set<number>>(new Set())
const bookmarkedArticleIds = ref<Set<number>>(new Set())

const onArticleLoad = async () => {
  if (articleFinished.value) return
  try {
    articleLoading.value = true
    const res = await Service.readArticlesApiV1CommunityArticlesGet(articleSkip, articleLimit)
    if (articleRefreshing.value) {
      articles.value = res
      articleRefreshing.value = false
    } else {
      articles.value.push(...res)
    }
    articleSkip += articleLimit
    if (res.length < articleLimit) { articleFinished.value = true }
    // 批量获取点赞与收藏状态
    await fetchArticleInteractionStatus()
  } catch (error) {
    console.error('获取文章失败', error)
    articleFinished.value = true
  } finally { articleLoading.value = false }
}

const fetchArticleInteractionStatus = async () => {
  const ids = articles.value.map(a => a.id!)
  if (ids.length === 0) return
  try {
    const [likeRes, bmRes] = await Promise.all([
      Service.batchLikeStatusApiV1LikeBatchPost({ target_type: 'article', target_ids: ids }),
      Service.batchBookmarkStatusApiV1BookmarkBatchPost({ target_type: 'article', target_ids: ids })
    ])
    likedArticleIds.value = new Set(likeRes.liked_target_ids)
    bookmarkedArticleIds.value = new Set(bmRes.bookmarked_target_ids)
  } catch (error) { console.error('获取互动状态失败', error) }
}

const onArticleRefresh = () => {
  articleFinished.value = false
  articleSkip = 0
  articleRefreshing.value = true
  onArticleLoad()
}

// ================= 2. 果农帖子 =================
const posts = ref<PostResponse[]>([])
const postLoading = ref(false)
const postFinished = ref(false)
const postRefreshing = ref(false)
let postSkip = 0
const postLimit = 10

const likedPostIds = ref<Set<number>>(new Set())
const bookmarkedPostIds = ref<Set<number>>(new Set())

const onPostLoad = async () => {
  if (postFinished.value) return
  try {
    postLoading.value = true
    const res = await Service.readPostsApiV1CommunityPostsGet(postSkip, postLimit)
    if (postRefreshing.value) {
      posts.value = res
      postRefreshing.value = false
    } else {
      posts.value.push(...res)
    }
    postSkip += postLimit
    if (res.length < postLimit) { postFinished.value = true }
    await fetchPostInteractionStatus()
  } catch (error) {
    console.error('获取帖子失败', error)
    postFinished.value = true
  } finally { postLoading.value = false }
}

const fetchPostInteractionStatus = async () => {
  const ids = posts.value.map(p => p.id!)
  if (ids.length === 0) return
  try {
    const [likeRes, bmRes] = await Promise.all([
      Service.batchLikeStatusApiV1LikeBatchPost({ target_type: 'post', target_ids: ids }),
      Service.batchBookmarkStatusApiV1BookmarkBatchPost({ target_type: 'post', target_ids: ids })
    ])
    likedPostIds.value = new Set(likeRes.liked_target_ids)
    bookmarkedPostIds.value = new Set(bmRes.bookmarked_target_ids)
  } catch (error) { console.error('获取互动状态失败', error) }
}

const onPostRefresh = () => {
  postFinished.value = false
  postSkip = 0
  postRefreshing.value = true
  onPostLoad()
}

// ================= 3. 路由跳转 =================
const goToAdminPublishArticle = () => router.push('/admin/article-publish')
const goToCreatePost = () => router.push('/post/create')
const goToPostDetail = (id: number) => router.push(`/post/detail/${id}`)
const goToArticleDetail = (id: number) => router.push(`/article/detail/${id}`)

const formatDate = (dateString?: string) => {
  if (!dateString) return '未知时间'
  return new Date(dateString).toLocaleDateString()
}
</script>

<template>
  <div class="community-container">
    <van-nav-bar title="互动社区" fixed placeholder border safe-area-inset-top />

    <van-tabs v-model:active="activeTab" sticky offset-top="0" color="#07c160" animated swipeable>
      <van-tab title="科普文章" name="articles">
        <van-pull-refresh v-model="articleRefreshing" @refresh="onArticleRefresh">
          <van-list v-model:loading="articleLoading" :finished="articleFinished" finished-text="没有更多文章了" @load="onArticleLoad" class="list-wrapper">
            <div v-for="item in articles" :key="item.id" class="pure-text-card article-item" @click="goToArticleDetail(item.id!)">
              <div class="card-tag-row">
                <van-tag type="primary" plain round>{{ item.category }}</van-tag>
                <div class="card-actions">
                  <span :class="['action-icon', { active: likedArticleIds.has(item.id!) }]">
                    <van-icon :name="likedArticleIds.has(item.id!) ? 'good-job' : 'good-job-o'" size="16" />
                  </span>
                  <span :class="['action-icon', { active: bookmarkedArticleIds.has(item.id!) }]">
                    <van-icon :name="bookmarkedArticleIds.has(item.id!) ? 'star' : 'star-o'" size="16" />
                  </span>
                  <span class="views"><van-icon name="eye-o" /> {{ item.views }}</span>
                </div>
              </div>
              <h3 class="title">{{ item.title }}</h3>
              <p class="content-preview van-multi-ellipsis--l2">{{ item.content }}</p>
              <div class="footer">
                <span class="author">专家团队</span>
                <span class="time">{{ formatDate(item.create_at) }}</span>
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
      </van-tab>

      <van-tab title="果农交流" name="posts">
        <van-pull-refresh v-model="postRefreshing" @refresh="onPostRefresh">
          <van-list v-model:loading="postLoading" :finished="postFinished" finished-text="没有更多帖子了" @load="onPostLoad" class="list-wrapper">
            <div v-for="post in posts" :key="post.id" class="pure-text-card post-item" @click="goToPostDetail(post.id!)">
              <div class="post-user-row">
                <div class="text-avatar">{{ String(post.author_id).slice(-1) }}</div>
                <div class="user-meta">
                  <span class="username">果农_{{ post.author_id }}</span>
                  <span class="post-time">{{ formatDate(post.create_at) }}</span>
                </div>
                <div class="card-actions">
                  <span :class="['action-icon', { active: likedPostIds.has(post.id!) }]">
                    <van-icon :name="likedPostIds.has(post.id!) ? 'good-job' : 'good-job-o'" size="16" />
                  </span>
                  <span :class="['action-icon', { active: bookmarkedPostIds.has(post.id!) }]">
                    <van-icon :name="bookmarkedPostIds.has(post.id!) ? 'star' : 'star-o'" size="16" />
                  </span>
                </div>
              </div>
              <h4 class="post-title">{{ post.title }}</h4>
              <p class="post-body van-multi-ellipsis--l3">{{ post.content }}</p>
            </div>
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>

    <div v-if="showFab" class="fab-btn" :style="{ backgroundColor: fabConfig.color }" @click="fabConfig.handler">
      <van-icon name="plus" />
    </div>
  </div>
</template>

<style scoped>
.community-container { background-color: #f7f8fa; min-height: 100vh; }
.list-wrapper { padding: 12px 16px; }
.pure-text-card {
  background: #ffffff; border-radius: 12px; padding: 16px;
  margin-bottom: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.pure-text-card:active { background-color: #f2f3f5; transform: scale(0.98); }

/* 卡片操作图标 */
.card-actions { display: flex; align-items: center; gap: 12px; }
.action-icon { color: #c8c9cc; cursor: pointer; }
.action-icon.active { color: #ee0a24; }
.views { font-size: 12px; color: #969799; }

.pure-text-card .title { margin: 0 0 8px 0; font-size: 17px; color: #323233; font-weight: 600; line-height: 1.4; }
.content-preview { font-size: 14px; color: #646566; line-height: 1.6; }
.footer { font-size: 12px; color: #c8c9cc; display: flex; gap: 12px; margin-top: 12px; }

.post-user-row { display: flex; align-items: center; margin-bottom: 12px; }
.text-avatar {
  width: 36px; height: 36px; background: linear-gradient(135deg, #07c160, #10ad7a);
  color: #fff; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0;
}
.user-meta { margin-left: 10px; display: flex; flex-direction: column; flex: 1; }
.username { font-size: 14px; font-weight: 500; color: #323233; }
.post-time { font-size: 11px; color: #969799; }
.post-title { font-size: 16px; font-weight: 600; margin: 0 0 6px 0; color: #323233; }
.post-body { font-size: 14px; color: #444; line-height: 1.6; }

.fab-btn {
  position: fixed; right: 24px; bottom: 80px; width: 52px; height: 52px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 24px; z-index: 2000; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}
</style>
