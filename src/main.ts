import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { OpenAPI } from './api/generated'
import axios from 'axios'

// 1. 配置后端的真实接口地址 (对应 FastAPI 的运行地址)
OpenAPI.BASE = 'http://127.0.0.1:8000'

// 2. 如果用户已经登录，可以在这里或者登录成功后注入 Token
const token = localStorage.getItem('token') // 假设你存在 localStorage 中
if (token) {
  OpenAPI.TOKEN = token
}

// 3. （进阶）如果你需要统一处理报错（比如 401 跳转登录页），可以拦截 Axios
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('登录已过期，请重新登录')
      // TODO: 清除 token，跳转到登录页
    }
    return Promise.reject(error)
  }
)

createApp(App).mount('#app')