// src\main.ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { OpenAPI } from './api/generated'
import axios from 'axios'

// 引入 Router 和 Vant
import router from './router'
import 'vant/lib/index.css'
import { 
  Button, Field, CellGroup, Form, Toast, 
  Tabbar, TabbarItem, NavBar, NoticeBar, 
  Swipe, SwipeItem, Grid, GridItem, 
  Tag, Card, Skeleton, Divider, Icon,
  Image as VanImage, Lazyload, PullRefresh, List, Search,
  Tabs, Tab, Empty, Cell, Badge, Radio, RadioGroup, Uploader, DatePicker, Popup, Picker,
  ActionBarButton, ActionBar, Dialog
} from 'vant'

// 1. 配置后端的真实接口地址
OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

// 2. 【优化】将 TOKEN 配置为一个函数，这样每次请求前都会实时去 localStorage 获取最新值
OpenAPI.TOKEN = async () => {
  return localStorage.getItem('token') || ''
}

// 3. 配置全局 Axios 拦截器
axios.interceptors.response.use(
  (response) => {
    // 请求成功直接放行
    return response
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('登录已过期或未登录，请重新登录')
          // 清除失效的 token
          localStorage.removeItem('token')
          // TODO: 这里后续可以引入 router 实现自动跳转
          // router.push('/login')
          break
        case 403:
          console.error('权限不足，无法执行此操作')
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器内部错误')
          break
      }
    } else {
      console.error('网络连接失败，请检查后端服务是否启动')
    }
    return Promise.reject(error)
  }
)

const app = createApp(App)

// 如果配置了 router 或 pinia，在这里 use 它们
app.use(router)
// 注册组件
app.use(Button).use(Field).use(CellGroup).use(Form).use(Toast)
app.use(Tabbar).use(TabbarItem).use(NavBar).use(NoticeBar)
app.use(Swipe).use(SwipeItem).use(Grid).use(GridItem)
app.use(Tag).use(Card).use(Skeleton).use(Divider).use(Icon)
app.use(VanImage).use(PullRefresh).use(List).use(Search)
app.use(Tab).use(Tabs).use(Empty).use(Cell).use(Badge).use(Radio).use(RadioGroup).use(Uploader).use(DatePicker).use(Popup).use(Picker)
app.use(ActionBarButton).use(ActionBar).use(Dialog)

app.use(Lazyload)

app.mount('#app')