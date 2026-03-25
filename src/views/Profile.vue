<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Service } from '../api/generated'
import type { UserResponse } from '../api/generated'

const router = useRouter()

// 用户状态
const userInfo = ref<UserResponse | null>(null)
const loading = ref(true)

// 获取当前登录用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    const res = await Service.readUsersMeApiV1UsersMeGet()
    userInfo.value = res
  } catch (error) {
    console.error('获取用户信息失败，可能Token已过期', error)
    // 实际项目中可在此处强制跳转到登录页
    // router.replace('/login')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserInfo()
})

// 判断是否为B端用户（专家或管理员）。假设 RoleEnum 中 0=果农, 1=专家, 2=管理员
const isBEndUser = computed(() => {
  if (!userInfo.value || userInfo.value.role === undefined) return false
  // 只要 role 大于 0，即可认为是B端工作人员（专家/管理员）
  // 考虑到严格的 TS 枚举类型，这里转一下 Number 判断更稳妥
  return Number(userInfo.value.role) !== 0
})

// 路由跳转
const navigateTo = (path: string) => {
  router.push(path)
}

// 退出登录
const handleLogout = () => {
  // 1. 清除本地存储的 Token (具体 key 名根据你项目中的定义为准)
  localStorage.removeItem('access_token') 
  // 2. 跳转到登录页
  router.replace('/login')
}
</script>

<template>
  <div class="profile-container">
    <van-nav-bar title="我的" fixed placeholder border />

    <div class="user-card van-hairline--bottom">
      <van-skeleton title avatar :row="2" :loading="loading">
        <div class="user-info" v-if="userInfo">
          <van-image
            class="avatar"
            round
            width="64"
            height="64"
            fit="cover"
            src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
          />
          <div class="user-detail">
            <h2 class="name">{{ userInfo.username || '未命名用户' }}</h2>
            <p class="email">{{ userInfo.email }}</p>
            <div class="role-tag">
              <van-tag :type="isBEndUser ? 'primary' : 'success'" plain size="medium">
                {{ isBEndUser ? (Number(userInfo.role) === 2 ? '系统管理员' : '农业专家') : '果农' }}
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

    <van-cell-group inset class="menu-group">
      <van-cell 
        title="编辑资料" 
        icon="edit" 
        is-link 
        @click="navigateTo('/profile/edit')" 
      />
      <van-cell 
        title="找回密码" 
        icon="shield-o" 
        is-link 
        @click="navigateTo('/forgot-password')" 
      />
      <van-cell 
        title="我的治理记录" 
        icon="records" 
        is-link 
        @click="navigateTo('/record/list')" 
      />
      <van-cell 
        title="消息中心" 
        icon="chat-o" 
        is-link 
        @click="navigateTo('/message/list')" 
      />
    </van-cell-group>

    <van-cell-group v-if="isBEndUser" inset class="menu-group admin-group">
      <template #title>
        工作台 (仅内部人员可见)
      </template>
      <van-cell 
        title="内容审核" 
        icon="desktop-o" 
        is-link 
        @click="navigateTo('/admin/audit')" 
      >
        <template #right-icon>
           <van-badge dot><van-icon name="arrow" class="custom-arrow" /></van-badge>
        </template>
      </van-cell>
      <van-cell 
        title="发布预警" 
        icon="warn-o" 
        is-link 
        @click="navigateTo('/admin/warning-publish')" 
      />
      <van-cell 
        title="管理知识库" 
        icon="description-o" 
        is-link 
        @click="navigateTo('/admin/pest/list')" 
      />
    </van-cell-group>

    <div class="logout-btn-wrapper">
      <van-button type="default" block round class="logout-btn" @click="handleLogout">
        退出登录
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  background-color: #f7f8fa;
  padding-bottom: 20px;
}

/* 用户卡片区 */
.user-card {
  background-color: #fff;
  padding: 30px 20px;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  margin-right: 15px;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-detail .name {
  margin: 0 0 5px 0;
  font-size: 20px;
  color: #323233;
  font-weight: 600;
}

.user-detail .email {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #969799;
}

.arrow-icon {
  font-size: 20px;
  padding-left: 10px;
}

/* 菜单组 */
.menu-group {
  margin-bottom: 15px;
}

.admin-group :deep(.van-cell-group__title) {
  padding-top: 5px;
  padding-bottom: 10px;
  color: #ee0a24; /* 给内部工作台一个醒目的提示色 */
  font-weight: bold;
}

/* 退出按钮 */
.logout-btn-wrapper {
  padding: 20px 16px;
  margin-top: 20px;
}

.logout-btn {
  color: #ee0a24;
  font-weight: bold;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.custom-arrow {
  font-size: 16px;
  color: #969799;
  margin-left: 4px;
}
</style>