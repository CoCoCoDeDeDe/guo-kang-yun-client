<!-- src\views\Register.vue -->
 <script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { Service } from '../api/generated'

const router = useRouter()

// 表单数据
const formData = ref({
  email: '',
  code: '',
  username: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

// 组件销毁时清除定时器
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 验证邮箱格式
const validateEmail = (val: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || '请输入正确的邮箱格式'
}

// 验证确认密码
const validateConfirmPassword = (val: string) => {
  return val === formData.value.password || '两次输入的密码不一致'
}

// 发送验证码
const sendCode = async () => {
  if (!formData.value.email) {
    showFailToast('请先输入邮箱')
    return
  }
  const emailValid = validateEmail(formData.value.email)
  if (emailValid !== true) {
    showFailToast(emailValid as string)
    return
  }

  sendingCode.value = true
  try {
    // 调用发送验证码接口
    await Service.sendRegisterCodeApiV1UsersSendRegisterCodePost({
      email: formData.value.email
    })
    showSuccessToast('验证码发送成功')
    
    // 开始倒计时 60 秒
    countdown.value = 60
    if (timer) clearInterval(timer)
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        if (timer) clearInterval(timer)
      }
    }, 1000)
  } catch (error: any) {
    console.error('发送验证码失败', error)
    if (error.body && error.body.detail) {
      showFailToast(typeof error.body.detail === 'string' ? error.body.detail : '发送验证码失败')
    } else {
      showFailToast('发送验证码失败，请重试')
    }
  } finally {
    sendingCode.value = false
  }
}

// 提交注册
const onSubmit = async () => {
  loading.value = true
  try {
    // 调用注册接口
    await Service.registerApiV1UsersRegisterPost({
      email: formData.value.email,
      username: formData.value.username,
      password: formData.value.password,
      code: formData.value.code
    })
    
    showSuccessToast('注册成功，请登录')
    // 注册成功后跳转到登录页
    router.replace('/login')
  } catch (error: any) {
    console.error('注册失败', error)
    if (error.body && error.body.detail) {
      showFailToast(typeof error.body.detail === 'string' ? error.body.detail : '注册失败，请检查填写的信息')
    } else {
      showFailToast('注册失败，请重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-container">
    <van-nav-bar 
      title="账号注册" 
      left-text="返回" 
      left-arrow 
      fixed 
      placeholder 
      border
      @click-left="onClickLeft" 
    />

    <div class="header">
      <h2 class="title">欢迎加入果康云</h2>
      <p class="subtitle">创建您的账号以体验完整功能</p>
    </div>

    <div class="form-wrapper">
      <van-form @submit="onSubmit">
        <van-cell-group inset class="form-group">
          <van-field
            v-model="formData.email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱"
            :rules="[
              { required: true, message: '邮箱不能为空' },
              { validator: validateEmail }
            ]"
          />
          
          <van-field
            v-model="formData.code"
            name="code"
            label="验证码"
            placeholder="请输入 6 位验证码"
            :rules="[{ required: true, message: '验证码不能为空' }]"
          >
            <template #button>
              <van-button 
                size="small" 
                type="primary" 
                plain
                :disabled="countdown > 0 || sendingCode" 
                :loading="sendingCode"
                @click.prevent="sendCode"
              >
                {{ countdown > 0 ? `${countdown}s 后重发` : '发送验证码' }}
              </van-button>
            </template>
          </van-field>

          <van-field
            v-model="formData.username"
            name="username"
            label="昵称"
            placeholder="请输入昵称"
            :rules="[{ required: true, message: '昵称不能为空' }]"
          />

          <van-field
            v-model="formData.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码（不少于6位）"
            :rules="[
              { required: true, message: '密码不能为空' },
              { pattern: /^.{6,}$/, message: '密码长度不能少于6位' }
            ]"
          />

          <van-field
            v-model="formData.confirmPassword"
            type="password"
            name="confirmPassword"
            label="确认密码"
            placeholder="请再次输入密码"
            :rules="[
              { required: true, message: '请确认密码' },
              { validator: validateConfirmPassword }
            ]"
          />
        </van-cell-group>

        <div class="submit-btn-wrap">
          <van-button 
            round 
            block 
            type="primary" 
            native-type="submit" 
            :loading="loading" 
            color="#07c160"
          >
            立即注册
          </van-button>
        </div>
        
        <div class="login-link">
          <span class="text">已有账号？</span>
          <span class="link" @click="router.replace('/login')">去登录</span>
        </div>
      </van-form>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  background-color: #f7f8fa;
  min-height: 100vh;
}

.header {
  padding: 32px 24px 24px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #323233;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #969799;
  margin: 0;
}

.form-wrapper {
  padding-bottom: 24px;
}

.form-group {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.submit-btn-wrap {
  margin: 32px 16px 16px 16px;
}

.login-link {
  text-align: center;
  font-size: 14px;
  margin-top: 24px;
}

.login-link .text {
  color: #969799;
}

.login-link .link {
  color: #1989fa;
  font-weight: 500;
  cursor: pointer;
}
</style>