<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { Service } from '../api/generated'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)

// 简单的邮箱正则校验
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const onSubmit = async () => {
  loading.value = true
  try {
    /**
     * FastAPI 的 OAuth2 密码流要求传入 formData
     * 注意：后端字段固定为 username，我们在此传入 email
     */
    const res = await Service.loginForAccessTokenApiV1UsersLoginPost({
      username: email.value,
      password: password.value,
    })
    
    // 1. 保存 Token 到本地
    localStorage.setItem('token', res.access_token)
    
    showToast({ type: 'success', message: '欢迎回来' })
    
    // 2. 登录成功后跳转到首页
    // 如果之前是从其他受保护页面拦截过来的，也可以跳转回原页面
    router.replace('/') 
  } catch (error: any) {
    // 优先展示后端返回的详细错误信息
    const detail = error.body?.detail || '登录失败，请检查账号或密码'
    showToast({ type: 'fail', message: detail })
  } finally {
    loading.value = false
  }
}

const goToRegister = () => router.push('/register')
const goToForgot = () => router.push('/forgot-password')
</script>

<template>
  <div class="login-wrapper">
    <div class="header">
      <div class="logo">🍏</div>
      <h1>果康云</h1>
      <p>智能农技与灾情预警平台</p>
    </div>

    <van-form @submit="onSubmit" class="form">
      <van-cell-group inset>
        <van-field
          v-model="email"
          name="email"
          label="邮箱"
          placeholder="请输入注册邮箱"
          clearable
          :rules="[
            { required: true, message: '请输入邮箱' },
            { pattern: emailPattern, message: '邮箱格式不正确' }
          ]"
        />
        <van-field
          v-model="password"
          v-current-password
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          clearable
          :rules="[{ required: true, message: '请输入密码' }]"
        />
      </van-cell-group>

      <div class="action-btn">
        <van-button 
          round 
          block 
          type="primary" 
          native-type="submit" 
          :loading="loading"
          loading-text="登录中..."
        >
          立即登录
        </van-button>
      </div>
    </van-form>

    <div class="footer-links">
      <span @click="goToRegister">注册账号</span>
      <van-divider vertical />
      <span @click="goToForgot">忘记密码</span>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  padding: 40px 20px;
  background-color: #f7f8fa;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 50px;
  margin-top: 40px;
}

.logo {
  font-size: 64px;
  margin-bottom: 10px;
}

.header h1 {
  font-size: 28px;
  color: #2c3e50;
  margin: 0;
}

.header p {
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 8px;
}

.form {
  margin-top: 30px;
}

.action-btn {
  margin: 32px 16px 16px;
}

.footer-links {
  text-align: center;
  font-size: 14px;
  color: #1989fa;
  margin-top: 20px;
}

.footer-links span {
  padding: 0 10px;
}
</style>

<!-- 🗝️ 2. 核心逻辑解释
localStorage 存储：登录成功后我们将 access_token 存入本地。由于你在 src/main.ts 中已经配置了 OpenAPI.TOKEN = async () => localStorage.getItem('token') || ''，这行代码运行后，App 发出的后续所有请求都会自动在 Header 中带上 Authorization: Bearer <token>。

router.replace('/')：使用 replace 而不是 push 是为了防止用户点击手机系统的“返回键”又回到了登录页面。

错误捕获：生成的 Service 在遇到 4xx/5xx 状态码时会抛出异常。通过 error.body?.detail 可以拿到 FastAPI 自动生成的错误提示（例如“用户不存在”）。 -->