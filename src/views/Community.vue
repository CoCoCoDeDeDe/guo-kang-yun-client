<!-- src\views\Community.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue' // 引入 onMounted 和 computed
import { useRouter } from 'vue-router'
import { Service } from '../api/generated'
import type { ArticleResponse, PostResponse, UserResponse } from '../api/generated'

const router = useRouter()

// 当前激活的标签
const activeTab = ref('articles')

// ================= 0. 用户信息与权限逻辑 =================
const userInfo = ref<UserResponse | null>(null)

// 获取当前登录用户信息
const fetchUserInfo = async () => {
  try {
    const res = await Service.readUsersMeApiV1UsersMeGet()
    userInfo.value = res
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

onMounted(() => {
  fetchUserInfo()
})

// 判断是否有发布科普文章的权限 (角色枚举不为 0)
const canPublishArticle = computed(() => {
  if (!userInfo.value || userInfo.value.role === undefined) return false
  return Number(userInfo.value.role) !== 0
})

// 控制 FAB 是否显示
const showFab = computed(() => {
  if (activeTab.value === 'posts') {
    return true // 果农交流一直显示
  } else if (activeTab.value === 'articles') {
    return canPublishArticle.value // 科普文章仅有权限时显示
  }
  return false
})

// 动态配置 FAB 的样式和点击事件
const fabConfig = computed(() => {
  if (activeTab.value === 'articles') {
    return {
      color: '#1989fa', // 蓝色
      shadow: 'rgba(25, 137, 250, 0.4)',
      handler: goToAdminPublishArticle
    }
  }
  return {
    color: '#07c160', // 绿色 (果农交流)
    shadow: 'rgba(7, 193, 96, 0.4)',
    handler: goToCreatePost
  }
})

// ================= 1. 文章专栏状态与逻辑 =================
const articles = ref<ArticleResponse[]>([])
const articleLoading = ref(false)
const articleFinished = ref(false)
const articleRefreshing = ref(false)
let articleSkip = 0
const articleLimit = 10

const onArticleLoad = async () => {
  if (articleFinished.value) return;

  try {
    articleLoading.value = true;
    const res = await Service.readArticlesApiV1CommunityArticlesGet(articleSkip, articleLimit)

    if (articleRefreshing.value) {
      articles.value = res
      articleRefreshing.value = false
    } else {
      articles.value.push(...res)
    }

    articleSkip += articleLimit
    if (res.length < articleLimit) {
      articleFinished.value = true
    }
  } catch (error) {
    console.error('获取文章失败', error)
    articleFinished.value = true
  } finally {
    articleLoading.value = false
  }
}

const onArticleRefresh = () => {
  articleFinished.value = false
  articleSkip = 0
  articleRefreshing.value = true
  onArticleLoad()
}


// ================= 2. 果农帖子状态与逻辑 =================
const posts = ref<PostResponse[]>([])
const postLoading = ref(false)
const postFinished = ref(false)
const postRefreshing = ref(false)
let postSkip = 0
const postLimit = 10

const onPostLoad = async () => {
  if (postFinished.value) return;

  try {
    postLoading.value = true;
    const res = await Service.readPostsApiV1CommunityPostsGet(postSkip, postLimit)

    if (postRefreshing.value) {
      posts.value = res
      postRefreshing.value = false
    } else {
      posts.value.push(...res)
    }

    postSkip += postLimit
    if (res.length < postLimit) {
      postFinished.value = true
    }
  } catch (error) {
    console.error('获取帖子失败', error)
    postFinished.value = true
  } finally {
    postLoading.value = false
  }
}

const onPostRefresh = () => {
  postFinished.value = false
  postSkip = 0
  postRefreshing.value = true
  onPostLoad()
}


// ================= 3. 路由跳转逻辑 =================
const goToAdminPublishArticle = () => {
  router.push('/admin/article-publish')
}

const goToCreatePost = () => {
  router.push('/post/create')
}

const goToPostDetail = (id: number) => {
  router.push(`/post/detail/${id}`)
}

const goToArticleDetail = (id: number) => {
  router.push(`/article/detail/${id}`)
}

// 格式化日期辅助函数
const formatDate = (dateString?: string) => {
  if (!dateString) return '未知时间'
  return new Date(dateString).toLocaleString()
}
</script>

<template>
  <div class="community-container">
    <van-nav-bar title="互动社区" fixed placeholder border>
      <template #right>
        <van-icon name="edit" size="18" @click="goToCreatePost" />
      </template>
    </van-nav-bar>

    <van-tabs v-model:active="activeTab" sticky offset-top="0" color="#07c160">

      <van-tab title="科普文章" name="articles">
        <van-pull-refresh v-model="articleRefreshing" @refresh="onArticleRefresh">
          <van-list v-model:loading="articleLoading" :finished="articleFinished" finished-text="没有更多文章了"
            @load="onArticleLoad" class="list-wrapper">
            <div v-for="item in articles" :key="item.id" class="card-item article-card"
              @click="goToArticleDetail(item.id!)">
              <div class="article-content">
                <h3 class="title van-multi-ellipsis--l2">{{ item.title }}</h3>
                <p class="desc van-multi-ellipsis--l2">{{ item.content }}</p>
                <div class="meta">
                  <span><van-icon name="clock-o" /> {{ formatDate(item.create_at) }}</span>
                  <van-tag plain type="primary" size="medium">官方</van-tag>
                </div>
              </div>
              <van-image class="article-img" width="80" height="80" radius="8" fit="cover"
                src="https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg" />
            </div>
          </van-list>
        </van-pull-refresh>
      </van-tab>

      <van-tab title="果农交流" name="posts">
        <van-pull-refresh v-model="postRefreshing" @refresh="onPostRefresh">
          <van-list v-model:loading="postLoading" :finished="postFinished" finished-text="没有更多帖子了" @load="onPostLoad"
            class="list-wrapper">
            <div v-for="post in posts" :key="post.id" class="card-item post-card" @click="goToPostDetail(post.id!)">
              <div class="post-header">
                <van-image round width="40" height="40" src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
                <div class="author-info">
                  <span class="name">果农用户_{{ post.author_id || '匿名' }}</span>
                  <span class="time">{{ formatDate(post.create_at) }}</span>
                </div>
              </div>
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-desc van-multi-ellipsis--l3">{{ post.content }}</p>

              <div class="post-actions">
                <span><van-icon name="good-job-o" /> 赞</span>
                <span><van-icon name="chat-o" /> 评论</span>
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
      </van-tab>

    </van-tabs>

    <div v-if="showFab" class="fab-button" :style="{
      backgroundColor: fabConfig.color,
      boxShadow: `0 4px 12px ${fabConfig.shadow}`
    }" @click="fabConfig.handler">
      <van-icon name="plus" />
    </div>

  </div>
</template>

<style scoped>
.community-container {
  background-color: #f7f8fa;
  min-height: 100%;
}

.list-wrapper {
  padding: 12px;
}

/* 通用卡片样式 */
.card-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 文章卡片特有样式 */
.article-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.article-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.article-content .title {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #323233;
  line-height: 1.4;
}

.article-content .desc {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #969799;
  line-height: 1.5;
}

.article-content .meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #c8c9cc;
  margin-top: auto;
}

.article-img {
  flex-shrink: 0;
}

/* 帖子卡片特有样式 */
.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.author-info {
  margin-left: 10px;
  display: flex;
  flex-direction: column;
}

.author-info .name {
  font-size: 14px;
  font-weight: bold;
  color: #323233;
}

.author-info .time {
  font-size: 12px;
  color: #969799;
  margin-top: 2px;
}

.post-title {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #323233;
}

.post-desc {
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.post-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  color: #969799;
  font-size: 13px;
  border-top: 1px solid #ebedf0;
  padding-top: 12px;
}

.post-actions span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 悬浮发帖按钮 (FAB) */
.fab-button {
  position: fixed;
  right: 20px;
  bottom: 80px;
  /* 留出 Tabbar 的高度 */
  width: 50px;
  height: 50px;
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  z-index: 99;
  /* 💡 修改点：加入 transition 使颜色变化平滑 */
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.1s;
}

.fab-button:active {
  transform: scale(0.9);
}
</style>
