import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  // 1. 登录页（不需要底部导航栏）
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  
  // 2. 主页面结构（带底部导航栏）
  {
    path: '/',
    component: MainLayout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: { requiresAuth: true, keepAlive: true }
      },
      {
        path: 'encyclopedia',
        name: 'Encyclopedia',
        component: () => import('../views/PestList.vue'),
        meta: { requiresAuth: true, keepAlive: true }
      },
      {
        path: 'community',
        name: 'Community',
        component: () => import('../views/Community.vue'), // 待创建
        meta: { requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'), // 待创建
        meta: { requiresAuth: true }
      }
    ]
  },

  // 3. 业务详情页（通常不需要底部导航栏，方便全屏展示）
  {
    path: '/pest/detail/:id',
    name: 'PestDetail',
    component: () => import('../views/PestDetail.vue'), // 待创建
    meta: { requiresAuth: true }
  },
  {
    path: '/record/form',
    name: 'RecordForm',
    component: () => import('../views/RecordForm.vue'), // 待创建
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫逻辑
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router