<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Service } from '../api/generated'
import type { UserResponse } from '../api/generated'

const router = useRouter()

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

const roleLabel = computed(() => {
  if (!userInfo.value) return ''
  const r = Number(userInfo.value.role)
  if (r === 2) return '系统管理员'
  if (r === 1) return '农业专家'
  return '认证果农'
})

const navigateTo = (path: string) => { router.push(path) }

const handleLogout = () => {
  localStorage.removeItem('token')
  router.replace('/login')
}
</script>

<template>
  <div class="profile-container">
    <van-nav-bar title="我的" fixed placeholder safe-area-inset-top />

    <!-- 个人卡片 -->
    <div class="profile-hero">
      <div class="ph-bg"></div>
      <div class="ph-content">
        <van-skeleton :loading="loading" avatar size="72px">
          <div class="ph-user" v-if="userInfo">
            <div class="ph-avatar">{{ (userInfo.username || userInfo.email).charAt(0) }}</div>
            <div class="ph-info">
              <h2 class="ph-name">{{ userInfo.username || '未命名用户' }}</h2>
              <p class="ph-email">{{ userInfo.email }}</p>
              <van-tag
                :type="isAdmin ? 'danger' : isBEndUser ? 'primary' : 'success'"
                size="medium"
                plain
                class="ph-role"
              >{{ roleLabel }}</van-tag>
            </div>
            <van-icon name="arrow" color="rgba(255,255,255,.6)" size="18" @click="navigateTo('/profile/edit')" />
          </div>
          <div v-else class="ph-user" @click="router.push('/login')">
            <div class="ph-avatar" style="background: rgba(255,255,255,.3)">?</div>
            <div class="ph-info"><h2 class="ph-name">未登录</h2><p class="ph-email">点击去登录</p></div>
          </div>
        </van-skeleton>
      </div>
    </div>

    <!-- 快捷入口 -->
    <van-cell-group inset>
      <van-cell title="编辑资料" icon="edit" is-link @click="navigateTo('/profile/edit')" />
      <van-cell title="找回密码" icon="shield-o" is-link @click="navigateTo('/forgot-password')" />
      <van-cell title="我的治理记录" icon="records" is-link @click="navigateTo('/record/list')" />
      <van-cell title="我的收藏" icon="star-o" is-link @click="navigateTo('/bookmarks')" />
      <van-cell title="消息中心" icon="chat-o" is-link @click="navigateTo('/message/list')" />
    </van-cell-group>

    <!-- 数据统计 -->
    <van-cell-group inset>
      <van-cell title="数据统计" icon="chart-trending-o" is-link @click="navigateTo('/statistics')" />
    </van-cell-group>

    <!-- 工作台 -->
    <van-cell-group v-if="isBEndUser" inset>
      <template #title><span style="color:#10b981;font-weight:600">工作台</span></template>
      <van-cell title="内容审核" icon="desktop-o" is-link @click="navigateTo('/admin/audit')">
        <template #right-icon><van-badge dot /></template>
      </van-cell>
      <van-cell title="发布预警" icon="warn-o" is-link @click="navigateTo('/admin/warning-publish')" />
      <van-cell title="管理知识库" icon="description-o" is-link @click="navigateTo('/admin/pest/list')" />
      <van-cell v-if="isAdmin" title="用户管理" icon="manager-o" is-link @click="navigateTo('/admin/users')" />
    </van-cell-group>

    <!-- 退出 -->
    <div class="logout-wrap">
      <van-button block round plain type="default" @click="handleLogout">退出登录</van-button>
    </div>
  </div>
</template>

<style scoped>
.profile-container { background: var(--color-bg); min-height: 100vh; padding-bottom: 30px; }

/* 渐变个人卡片 */
.profile-hero {
  margin: 12px 16px 16px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #10b981, #0d9488, #6366f1);
  box-shadow: 0 8px 24px rgba(16,185,129,.2);
}
.ph-bg {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.15) 0%, transparent 50%);
}
.ph-content { position: relative; padding: 28px 20px; }
.ph-user { display: flex; align-items: center; }
.ph-avatar {
  width: 64px; height: 64px; border-radius: 18px;
  background: rgba(255,255,255,.2);
  backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: 700; color: #fff;
  flex-shrink: 0; margin-right: 16px;
  border: 2px solid rgba(255,255,255,.25);
}
.ph-info { flex: 1; }
.ph-name { font-size: 20px; font-weight: 700; color: #fff; margin: 0 0 4px; }
.ph-email { font-size: 13px; color: rgba(255,255,255,.7); margin: 0 0 8px; }
.ph-role { background: rgba(255,255,255,.2) !important; border-color: rgba(255,255,255,.3) !important; color: #fff !important; }

/* Logout */
.logout-wrap { margin: 24px 40px; }
.logout-wrap :deep(.van-button) { color: var(--color-text-muted); border-color: var(--color-border); }
</style>
