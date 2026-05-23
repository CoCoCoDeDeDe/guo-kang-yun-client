<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Service } from '../api/generated'
import type { ArticleResponse, PostResponse, UserResponse } from '../api/generated'

const router = useRouter()

const activeTab = ref('articles')

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
  if (activeTab.value === 'articles') return { color: '#6366f1', handler: goToAdminPublishArticle }
  return { color: '#10b981', handler: goToCreatePost }
})

// Articles
const articles = ref<ArticleResponse[]>([])
const articleLoading = ref(false)
const articleFinished = ref(false)
const articleRefreshing = ref(false)
let articleSkip = 0
const articleLimit = 10
const likedArticleIds = ref<Set<number>>(new Set())
const bookmarkedArticleIds = ref<Set<number>>(new Set())

const onArticleLoad = async () => {
  if (articleFinished.value) return
  try {
    articleLoading.value = true
    const res = await Service.readArticlesApiV1CommunityArticlesGet(articleSkip, articleLimit)
    if (articleRefreshing.value) { articles.value = res; articleRefreshing.value = false }
    else { articles.value.push(...res) }
    articleSkip += articleLimit
    if (res.length < articleLimit) { articleFinished.value = true }
    await fetchArticleInteractionStatus()
  } catch (error) { console.error('获取文章失败', error); articleFinished.value = true }
  finally { articleLoading.value = false }
}

const fetchArticleInteractionStatus = async () => {
  const ids = articles.value.map(a => a.id!); if (ids.length === 0) return
  try {
    const [likeRes, bmRes] = await Promise.all([
      Service.batchLikeStatusApiV1LikeBatchPost({ target_type: 'article', target_ids: ids }),
      Service.batchBookmarkStatusApiV1BookmarkBatchPost({ target_type: 'article', target_ids: ids })
    ])
    likedArticleIds.value = new Set(likeRes.liked_target_ids)
    bookmarkedArticleIds.value = new Set(bmRes.bookmarked_target_ids)
  } catch (error) { console.error('获取互动状态失败', error) }
}

const onArticleRefresh = () => { articleFinished.value = false; articleSkip = 0; articleRefreshing.value = true; onArticleLoad() }

// Posts
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
    if (postRefreshing.value) { posts.value = res; postRefreshing.value = false }
    else { posts.value.push(...res) }
    postSkip += postLimit
    if (res.length < postLimit) { postFinished.value = true }
    await fetchPostInteractionStatus()
  } catch (error) { console.error('获取帖子失败', error); postFinished.value = true }
  finally { postLoading.value = false }
}

const fetchPostInteractionStatus = async () => {
  const ids = posts.value.map(p => p.id!); if (ids.length === 0) return
  try {
    const [likeRes, bmRes] = await Promise.all([
      Service.batchLikeStatusApiV1LikeBatchPost({ target_type: 'post', target_ids: ids }),
      Service.batchBookmarkStatusApiV1BookmarkBatchPost({ target_type: 'post', target_ids: ids })
    ])
    likedPostIds.value = new Set(likeRes.liked_target_ids)
    bookmarkedPostIds.value = new Set(bmRes.bookmarked_target_ids)
  } catch (error) { console.error('获取互动状态失败', error) }
}

const onPostRefresh = () => { postFinished.value = false; postSkip = 0; postRefreshing.value = true; onPostLoad() }

const goToAdminPublishArticle = () => router.push('/admin/article-publish')
const goToCreatePost = () => router.push('/post/create')
const goToPostDetail = (id: number) => router.push(`/post/detail/${id}`)
const goToArticleDetail = (id: number) => router.push(`/article/detail/${id}`)

const formatDate = (dateString?: string) => {
  if (!dateString) return ''; return new Date(dateString).toLocaleDateString()
}
</script>

<template>
  <div class="community-container">
    <van-nav-bar title="互动社区" fixed placeholder safe-area-inset-top />

    <van-tabs v-model:active="activeTab" sticky offset-top="0" animated swipeable>
      <van-tab title="科普文章" name="articles">
        <van-pull-refresh v-model="articleRefreshing" @refresh="onArticleRefresh">
          <van-list v-model:loading="articleLoading" :finished="articleFinished" finished-text="✨ 没有更多了" @load="onArticleLoad" class="list-wrapper">
            <div v-for="item in articles" :key="item.id" class="cm-card" @click="goToArticleDetail(item.id!)">
              <div class="cm-card-top">
                <van-tag plain round class="cm-tag">{{ item.category }}</van-tag>
                <div class="cm-icons">
                  <span :class="['cm-icon', { active: likedArticleIds.has(item.id!) }]">
                    <van-icon :name="likedArticleIds.has(item.id!) ? 'good-job' : 'good-job-o'" size="16" />
                  </span>
                  <span :class="['cm-icon', { active: bookmarkedArticleIds.has(item.id!) }]">
                    <van-icon :name="bookmarkedArticleIds.has(item.id!) ? 'star' : 'star-o'" size="16" />
                  </span>
                  <span class="cm-views"><van-icon name="eye-o" size="12" /> {{ item.views }}</span>
                </div>
              </div>
              <h3 class="cm-title">{{ item.title }}</h3>
              <p class="cm-desc">{{ item.content }}</p>
              <div class="cm-footer">
                <span>专家团队</span><span class="cm-dot">·</span><span>{{ formatDate(item.create_at) }}</span>
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
      </van-tab>

      <van-tab title="果农交流" name="posts">
        <van-pull-refresh v-model="postRefreshing" @refresh="onPostRefresh">
          <van-list v-model:loading="postLoading" :finished="postFinished" finished-text="✨ 没有更多了" @load="onPostLoad" class="list-wrapper">
            <div v-for="post in posts" :key="post.id" class="cm-card" @click="goToPostDetail(post.id!)">
              <div class="cm-post-row">
                <div class="cm-avatar">{{ String(post.author_id).slice(-1) }}</div>
                <div class="cm-user">
                  <span class="cm-username">果农_{{ post.author_id }}</span>
                  <span class="cm-time">{{ formatDate(post.create_at) }}</span>
                </div>
                <div class="cm-icons">
                  <span :class="['cm-icon', { active: likedPostIds.has(post.id!) }]">
                    <van-icon :name="likedPostIds.has(post.id!) ? 'good-job' : 'good-job-o'" size="16" />
                  </span>
                  <span :class="['cm-icon', { active: bookmarkedPostIds.has(post.id!) }]">
                    <van-icon :name="bookmarkedPostIds.has(post.id!) ? 'star' : 'star-o'" size="16" />
                  </span>
                </div>
              </div>
              <h4 class="cm-post-title">{{ post.title }}</h4>
              <p class="cm-post-body">{{ post.content }}</p>
            </div>
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>

    <div v-if="showFab" class="cm-fab" :style="{ background: fabConfig.color }" @click="fabConfig.handler">
      <van-icon name="plus" size="22" />
    </div>
  </div>
</template>

<style scoped>
.community-container { background: var(--color-bg); min-height: 100vh; }
.list-wrapper { padding: 12px 16px; }

.cm-card {
  background: #fff; border-radius: 16px; padding: 16px; margin-bottom: 12px;
  box-shadow: var(--shadow-sm); transition: all var(--transition-fast);
}
.cm-card:active { transform: scale(.985); box-shadow: var(--shadow-md); }

.cm-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.cm-tag { font-weight: 500; }
.cm-icons { display: flex; align-items: center; gap: 12px; }
.cm-icon { color: var(--color-text-muted); }
.cm-icon.active { color: #ef4444; }
.cm-views { font-size: 12px; color: var(--color-text-muted); display: flex; align-items: center; gap: 3px; }

.cm-title {
  font-size: 16px; font-weight: 600; color: var(--color-text-primary);
  margin: 0 0 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.cm-desc {
  font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; margin: 0 0 10px;
}
.cm-footer { font-size: 12px; color: var(--color-text-muted); }
.cm-dot { margin: 0 6px; }

/* Post */
.cm-post-row { display: flex; align-items: center; margin-bottom: 10px; }
.cm-avatar {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #10b981, #0d9488);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px; margin-right: 10px; flex-shrink: 0;
}
.cm-user { flex: 1; display: flex; flex-direction: column; }
.cm-username { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
.cm-time { font-size: 11px; color: var(--color-text-muted); }
.cm-post-title { font-size: 15px; font-weight: 600; margin: 0 0 6px; color: var(--color-text-primary); }
.cm-post-body {
  font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}

.cm-fab {
  position: fixed; right: 20px; bottom: 80px; width: 50px; height: 50px;
  border-radius: 16px; display: flex; align-items: center; justify-content: center;
  color: #fff; z-index: 2000; box-shadow: 0 6px 20px rgba(16,185,129,.3);
  transition: transform var(--transition-fast);
}
.cm-fab:active { transform: scale(.9); }
</style>
