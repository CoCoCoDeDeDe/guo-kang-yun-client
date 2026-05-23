<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { Service, RoleEnum } from '../api/generated'
import type { UserResponse } from '../api/generated'

const router = useRouter()

// 筛选与搜索
const filterRole = ref<RoleEnum | null>(null)
const searchText = ref('')

// 用户列表
const users = ref<UserResponse[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
let skip = 0
const limit = 20
const total = ref(0)

const roleOptions = [
  { text: '全部', value: null },
  { text: '果农', value: RoleEnum._0 },
  { text: '专家', value: RoleEnum._1 },
  { text: '管理员', value: RoleEnum._2 }
]

const roleLabel = (r?: RoleEnum) => {
  if (r === RoleEnum._0) return '果农'
  if (r === RoleEnum._1) return '专家'
  if (r === RoleEnum._2) return '管理员'
  return '未知'
}

const onLoad = async () => {
  if (finished.value) return
  try {
    loading.value = true
    const res = await Service.readUsersAdminListApiV1UsersAdminListGet(
      filterRole.value,
      searchText.value || undefined,
      skip,
      limit
    )
    if (refreshing.value) {
      users.value = res.items
      refreshing.value = false
    } else {
      users.value.push(...res.items)
    }
    total.value = res.total
    skip += limit
    if (res.items.length < limit) finished.value = true
  } catch (error) {
    console.error('获取用户列表失败', error)
    showToast('加载失败，请检查权限')
    finished.value = true
  } finally { loading.value = false }
}

const onRefresh = () => {
  finished.value = false
  skip = 0
  refreshing.value = true
  onLoad()
}

const onSearch = () => {
  finished.value = false
  skip = 0
  users.value = []
  onLoad()
}

// 修改角色
const changeRole = async (user: UserResponse) => {
  const targetRole = user.role === RoleEnum._0 ? RoleEnum._1 : RoleEnum._0
  const targetLabel = targetRole === RoleEnum._1 ? '专家' : '果农'
  try {
    await showConfirmDialog({
      title: '修改角色',
      message: `确定将用户 ${user.email} 的角色修改为「${targetLabel}」？`
    })
  } catch { return }

  try {
    await Service.updateUserRoleApiV1UsersAdminUserIdRolePut(user.id!, { role: targetRole })
    user.role = targetRole
    showToast('角色修改成功')
  } catch (error) {
    console.error('角色修改失败', error)
    showToast('修改失败，请检查权限或安全约束')
  }
}
</script>

<template>
  <div class="admin-users-container">
    <van-nav-bar title="用户管理" left-text="返回" left-arrow fixed placeholder safe-area-inset-top @click-left="router.back()" />

    <!-- 筛选栏 -->
    <van-cell-group inset class="filter-group">
      <van-field v-model="searchText" placeholder="搜索邮箱或昵称" clearable @keyup.enter="onSearch">
        <template #button>
          <van-button size="small" type="primary" @click="onSearch">搜索</van-button>
        </template>
      </van-field>
      <div class="role-filter">
        <van-radio-group v-model="filterRole" direction="horizontal" @change="onSearch">
          <van-radio v-for="opt in roleOptions" :key="String(opt.value)" :name="opt.value as any">{{ opt.text }}</van-radio>
        </van-radio-group>
      </div>
    </van-cell-group>

    <!-- 用户列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad" class="list-wrapper">
        <div v-for="user in users" :key="user.id" class="user-card">
          <div class="user-info">
            <div class="text-avatar">{{ (user.username || user.email).charAt(0) }}</div>
            <div class="user-meta">
              <span class="user-name">{{ user.username || '未设置昵称' }}</span>
              <span class="user-email">{{ user.email }}</span>
            </div>
          </div>
          <div class="user-actions">
            <van-tag :type="user.role === RoleEnum._2 ? 'danger' : user.role === RoleEnum._1 ? 'primary' : 'success'" size="medium">
              {{ roleLabel(user.role) }}
            </van-tag>
            <van-button v-if="user.role !== RoleEnum._2" size="mini" type="warning" plain round @click.stop="changeRole(user)">
              {{ user.role === RoleEnum._0 ? '升专家' : '降果农' }}
            </van-button>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <van-empty v-if="!loading && users.length === 0" description="暂无用户" />
  </div>
</template>

<style scoped>
.admin-users-container { background-color: #f7f8fa; min-height: 100vh; }
.filter-group { margin-top: 12px; }
.role-filter { padding: 10px 16px; display: flex; justify-content: center; }
.list-wrapper { padding: 12px 16px; }
.user-card {
  background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; align-items: center;
  justify-content: space-between;
}
.user-info { display: flex; align-items: center; gap: 12px; }
.text-avatar {
  width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #1989fa, #7232dd);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 16px; flex-shrink: 0; text-transform: uppercase;
}
.user-meta { display: flex; flex-direction: column; }
.user-name { font-size: 15px; font-weight: 600; color: #323233; }
.user-email { font-size: 12px; color: #969799; margin-top: 2px; }
.user-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
</style>
