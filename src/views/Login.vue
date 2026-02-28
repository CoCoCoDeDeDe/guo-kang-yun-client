<!-- src\views\Login.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
// 导入你自动生成的 Service (具体名字可能叫 UsersService 或 DefaultService)
import { Service } from '../api/generated'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)

const onSubmit = async () => {
  loading.value = true
  try {
    // 调用生成的登录接口
    // 注意：FastAPI 的 OAuth2 密码流要求传入 formData
    const res = await Service.loginForAccessTokenApiV1UsersLoginPost({
      username: email.value, // 后端 OAuth2 规范中账号字段叫 username，但我们传的是邮箱
      password: password.value,
    })
    
    // 登录成功，保存 Token
    localStorage.setItem('token', res.access_token)
    showToast({ type: 'success', message: '登录成功' })
    
    // 跳转到主页
    router.push('/')
  } catch (error: any) {
    showToast({ type: 'fail', message: error.response?.data?.detail || '登录失败，请检查账号密码' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="logo-area">
      <h1>🍎 果康云</h1>
      <p>病虫害预警与治理平台</p>
    </div>

    <van-form @submit="onSubmit" class="login-form">
      <van-cell-group inset>
        <van-field
          v-model="email"
          name="email"
          label="账号"
          placeholder="请输入注册邮箱"
          :rules="[{ required: true, message: '请填写邮箱' }]"
        />
        <van-field
          v-model="password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
      </van-cell-group>
      <div style="margin: 30px 16px;">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登 录
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  display: flex;
  flex-direction: column;
  padding-top: 20vh;
}

.logo-area {
  text-align: center;
  margin-bottom: 40px;
}

.logo-area h1 {
  margin: 0;
  font-size: 32px;
  color: #323233;
}

.logo-area p {
  color: #969799;
  font-size: 14px;
  margin-top: 10px;
}

.login-form {
  margin-top: 20px;
}
</style>