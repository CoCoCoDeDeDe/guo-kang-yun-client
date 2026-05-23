import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  // 登录页（不需要底部导航栏）
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  // 注册页（不需要底部导航栏）
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  // 找回密码页面（不需要底部导航栏）
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPassword.vue')
  },

  // 主页面结构（带底部导航栏）
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
        component: () => import('../views/Community.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },

  // 3. 业务详情页（通常不需要底部导航栏，方便全屏展示）
  {
    path: '/pest/detail/:id',
    name: 'PestDetail',
    component: () => import('../views/PestDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/record/list',
    name: 'RecordList',
    component: () => import('../views/RecordList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/record/form',
    name: 'RecordForm',
    component: () => import('../views/RecordForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/record/detail/:id',
    name: 'RecordDetail',
    component: () => import('../views/RecordDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/article/detail/:id',
    name: 'ArticleDetail',
    component: () => import('../views/ArticleDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/post/detail/:id',
    name: 'PostDetail',
    component: () => import('../views/PostDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/post/create',
    name: 'PostCreate',
    component: () => import('../views/PostCreate.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/message/list',
    name: 'MessageList',
    component: () => import('../views/MessageList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/message/detail/:id',
    name: 'MessageDetail',
    component: () => import('../views/MessageDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/edit',
    name: 'ProfileEdit',
    component: () => import('../views/ProfileEdit.vue'),
    meta: { requiresAuth: true }
  },

  // 4. 收藏 & 统计
  {
    path: '/bookmarks',
    name: 'BookmarkList',
    component: () => import('../views/BookmarkList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue'),
    meta: { requiresAuth: true }
  },

  // 5. 管理后台（需 ADMIN 角色）
  {
    path: '/admin/audit',
    name: 'AuditDashboard',
    component: () => import('../views/AuditDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/audit/action/:id',
    name: 'AuditAction',
    component: () => import('../views/AuditAction.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/article-publish',
    name: 'ArticlePublish',
    component: () => import('../views/ArticlePublish.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/warning-publish',
    name: 'WarningPublish',
    component: () => import('../views/WarningPublish.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/pest/list',
    name: 'AdminPestList',
    component: () => import('../views/AdminPestList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/pest/post',
    name: 'AdminPestPost',
    component: () => import('../views/AdminPestPost.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/pest/edit/:id',
    name: 'AdminPestEdit',
    component: () => import('../views/AdminPestEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/AdminUsers.vue'),
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫逻辑
router.beforeEach((to, _, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
