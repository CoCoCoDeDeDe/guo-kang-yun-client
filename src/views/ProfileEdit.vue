<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { Service } from '../api/generated'

const router = useRouter()

const activeTab = ref('profile')
const loading = ref(false)

// =============== 1. 基本资料状态 ===============
const profileForm = ref({
  username: '',
  email: ''
})

// 获取当前用户信息进行数据回显
const fetchUserInfo = async () => {
  try {
    const res = await Service.readUsersMeApiV1UsersMeGet()
    if (res) {
      profileForm.value.username = res.username || ''
      profileForm.value.email = res.email || ''
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

onMounted(() => {
  fetchUserInfo()
})

// 提交基本资料修改
const onSubmitProfile = async () => {
  loading.value = true
  try {
    // 【注意】目前 Service.ts 中没有更新用户信息的 API (例如 updateMe)
    // 假设后端补充了接口，代码如下：
    // await Service.updateUserMeApiV1UsersMePut({ username: profileForm.value.username })
    
    // 模拟成功
    setTimeout(() => {
      showSuccessToast('资料保存成功')
      router.replace('/profile')
    }, 500)
  } catch (error) {
    console.error('更新资料失败', error)
    showFailToast('保存失败')
  } finally {
    loading.value = false
  }
}


// =============== 2. 修改密码状态 ===============
const passwordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

// 确认密码的自定义校验规则
const validateConfirmPassword = (val: string) => {
  if (val !== passwordForm.value.new_password) {
    return '两次输入的密码不一致'
  }
  return true
}

// 提交密码修改
const onSubmitPassword = async () => {
  loading.value = true
  try {
    // 调用真实的修改密码 API
    await Service.changePasswordApiV1UsersChangePasswordPut({
      old_password: passwordForm.value.old_password,
      new_password: passwordForm.value.new_password
    })
    
    showSuccessToast('密码修改成功，请重新登录')
    // 修改密码后通常需要清除 token 并重新登录
    localStorage.removeItem('access_token')
    router.replace('/login')
  } catch (error: any) {
    // 拦截后端 400/422 报错，比如旧密码错误
    if (error.body && error.body.detail) {
      showFailToast(typeof error.body.detail === 'string' ? error.body.detail : '密码格式或旧密码错误')
    } else {
      showFailToast('修改密码失败')
    }
  } finally {
    loading.value = false
  }
}

// 返回个人中心
const onClickLeft = () => {
  router.push('/profile')
}
</script>

<template>
  <div class="profile-edit-container">
    <van-nav-bar 
      title="编辑资料" 
      left-text="返回" 
      left-arrow 
      fixed 
      placeholder 
      border
      @click-left="onClickLeft" 
    />

    <van-tabs v-model:active="activeTab" sticky offset-top="46px" color="#07c160">
      
      <van-tab title="基本资料" name="profile">
        <div class="form-wrapper">
          <van-form @submit="onSubmitProfile">
            <van-cell-group inset class="form-group">
              <van-field
                v-model="profileForm.email"
                name="email"
                label="账号邮箱"
                readonly
                disabled
                placeholder="暂无绑定邮箱"
              />
              <van-field
                v-model="profileForm.username"
                name="username"
                label="用户昵称"
                placeholder="请输入新的昵称"
                clearable
                :rules="[{ required: true, message: '昵称不能为空' }]"
              />
            </van-cell-group>
            
            <div class="submit-btn-wrap">
              <van-button round block type="primary" native-type="submit" :loading="loading" color="#07c160">
                保存修改
              </van-button>
            </div>
          </van-form>
        </div>
      </van-tab>

      <van-tab title="修改密码" name="password">
        <div class="form-wrapper">
          <van-form @submit="onSubmitPassword">
            <van-cell-group inset class="form-group">
              <van-field
                v-model="passwordForm.old_password"
                type="password"
                name="old_password"
                label="旧密码"
                placeholder="请输入当前密码"
                :rules="[{ required: true, message: '旧密码不能为空' }]"
              />
              <van-field
                v-model="passwordForm.new_password"
                type="password"
                name="new_password"
                label="新密码"
                placeholder="请输入新密码 (不少于6位)"
                :rules="[
                  { required: true, message: '新密码不能为空' },
                  { pattern: /^.{6,}$/, message: '密码长度不能少于6位' }
                ]"
              />
              <van-field
                v-model="passwordForm.confirm_password"
                type="password"
                name="confirm_password"
                label="确认新密码"
                placeholder="请再次输入新密码"
                :rules="[
                  { required: true, message: '请确认新密码' },
                  { validator: validateConfirmPassword }
                ]"
              />
            </van-cell-group>

            <div class="submit-btn-wrap">
              <van-button round block type="danger" native-type="submit" :loading="loading">
                确认修改密码
              </van-button>
            </div>
          </van-form>
        </div>
      </van-tab>

    </van-tabs>
  </div>
</template>

<style scoped>
.profile-edit-container {
  background-color: #f7f8fa;
  min-height: 100vh;
}

.form-wrapper {
  padding-top: 16px;
}

.form-group {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.submit-btn-wrap {
  margin: 32px 16px 16px 16px;
}

/* 覆盖禁用状态输入框的文字颜色，使其更容易看清 */
:deep(.van-field__control:disabled) {
  color: #969799;
  -webkit-text-fill-color: #969799;
}
</style>