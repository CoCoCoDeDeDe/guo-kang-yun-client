<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Service } from '../api/generated'
import type { UserResponse } from '../api/generated'

const router = useRouter()

// 用户状态
const userInfo = ref<UserResponse | null>(null)
const loading = ref(true)

const fetchUserInfo = async () => {
  loading.value = true
  try {
    const res = await Service.readUsersMeApiV1UsersMeGet()
    userInfo.value = res
  } catch (error) {
    console.error('获取用户信息失败', error)
  } finally { loading.value = false }
}

onMounted(() => { fetchUserInfo() })

const isBEndUser = computed(() => {
  if (!userInfo.value || userInfo.value.role === undefined) return false
  return Number(userInfo.value.role) !== 0
})

const isAdmin = computed(() => {
  return userInfo.value?.role === 2
})

const navigateTo = (path: string) => { router.push(path) }

const handleLogout = () => {
  localStorage.removeItem('token')
  router.replace('/login')
}
</script>

<template>
  <div class="profile-container">
    <van-nav-bar title="我的" fixed placeholder border safe-area-inset-top />

    <div class="user-card">
      <van-skeleton title avatar :row="2" :loading="loading">
        <div class="user-info" v-if="userInfo">
          <van-image class="avatar" round width="64" height="64" fit="cover"
            src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
          <div class="user-detail">
            <h2 class="name">{{ userInfo.username || '未命名用户' }}</h2>
            <p class="email">{{ userInfo.email }}</p>
            <div class="role-tag">
              <van-tag :type="isAdmin ? 'danger' : isBEndUser ? 'primary' : 'success'" plain size="medium">
                {{ isAdmin ? '系统管理员' : isBEndUser ? '农业专家' : '果农' }}
              </van-tag>
            </div>
          </div>
          <van-icon name="arrow" class="arrow-icon" color="#969799" @click="navigateTo('/profile/edit')" />
        </div>
        <div v-else class="user-info" @click="router.push('/login')">
          <van-image class="avatar" round width="64" height="64" />
          <div class="user-detail">
            <h2 class="name">未登录</h2>
            <p class="email">点击去登录</p>
          </div>
        </div>
      </van-skeleton>
    </div>

    <!-- 个人功能 -->
    <van-cell-group inset class="menu-group">
      <van-cell title="编辑资料" icon="edit" is-link @click="navigateTo('/profile/edit')" />
      <van-cell title="找回密码" icon="shield-o" is-link @click="navigateTo('/forgot-password')" />
      <van-cell title="我的治理记录" icon="records" is-link @click="navigateTo('/record/list')" />
      <van-cell title="我的收藏" icon="star-o" is-link @click="navigateTo('/bookmarks')" />
      <van-cell title="消息中心" icon="chat-o" is-link @click="navigateTo('/message/list')" />
    </van-cell-group>

    <!-- 数据统计（所有人可见） -->
    <van-cell-group inset class="menu-group">
      <van-cell title="数据统计" icon="chart-trending-o" is-link @click="navigateTo('/statistics')" />
    </van-cell-group>

    <!-- B端工作台 -->
    <van-cell-group v-if="isBEndUser" inset class="menu-group admin-group">
      <template #title>工作台（仅内部人员可见）</template>
      <van-cell title="内容审核" icon="desktop-o" is-link @click="navigateTo('/admin/audit')">
        <template #right-icon>
          <van-badge dot><van-icon name="arrow" class="custom-arrow" /></van-badge>
        </template>
      </van-cell>
      <van-cell title="发布预警" icon="warn-o" is-link @click="navigateTo('/admin/warning-publish')" />
      <van-cell title="管理知识库" icon="description-o" is-link @click="navigateTo('/admin/pest/list')" />
      <van-cell v-if="isAdmin" title="用户管理" icon="manager-o" is-link @click="navigateTo('/admin/users')" />
    </van-cell-group>

    <!-- 退出登录 -->
    <div class="logout-btn-wrapper">
      <van-button type="default" block round class="logout-btn" @click="handleLogout">退出登录</van-button>
    </div>
  </div>
</template>

<style scoped>
.profile-container { background-color: #f7f8fa; padding-bottom: 20px; min-height: 100vh; }
.user-card { background-color: #fff; padding: 30px 20px; margin-bottom: 15px; }
.user-info { display: flex; align-items: center; }
.avatar { margin-right: 15px; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.user-detail { flex: 1; display: flex; flex-direction: column; }
.user-detail .name { margin: 0 0 5px 0; font-size: 20px; color: #323233; font-weight: 600; }
.user-detail .email { margin: 0 0 8px 0; font-size: 14px; color: #969799; }
.arrow-icon { font-size: 20px; padding-left: 10px; }
.menu-group { margin-bottom: 14px; }
.admin-group :deep(.van-cell-group__title) {
  color: #07c160; font-size: 13px; font-weight: 500; padding-top: 4px;
}
.logout-btn-wrapper { margin: 20px 24px; }
.logout-btn { color: #969799; border-color: #ebedf0; }
.custom-arrow { font-size: 14px; }
</style>
