// android\app\src\router\index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    // 稍后我们再写主页，先随便指向一个或者留空
    component: () => import('../components/HelloWorld.vue'),
    meta: { requiresAuth: true } // 标记需要登录才能访问
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：如果没有 Token，且访问的不是登录页，强制跳转登录
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
