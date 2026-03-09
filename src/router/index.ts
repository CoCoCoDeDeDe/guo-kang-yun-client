// android\app\src\router\index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    name: 'Main',
    component: () => import('../layout/MainLayout.vue'),  // 底部导航容器
    redirect: '/home',
    children: [
      { path: 'home', name: 'Home', component: () => import('../views/Home.vue') },
      { path: 'encyclopedia', name: 'Encyclopedia', component: () => import('../views/PestList.vue') },
      { path: 'community', name: 'Community', component: () => import('../views/Community.vue') },
      { path: 'profile', name: 'Profile', component: () => import('../views/Profile.vue') },
    ]
  },
  { path: '/pest/detail/:id', name: 'PestDetail', component: () => import('../views/PestDetail.vue') },
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

    // meta: { requiresAuth: true } // 标记需要登录才能访问
