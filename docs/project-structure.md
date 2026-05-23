# 果康云（Guo Kang Yun）客户端项目结构文档

> 生成日期：2026-05-23 | 版本：1.0.0

---

## 1. 项目概要

| 项目 | 说明 |
|------|------|
| 名称 | 果康云（Guo Kang Yun） |
| 定位 | 农业病虫害管理平台 — 移动端客户端 |
| 平台 | Android（Capacitor 打包）+ Web（Vite SPA） |
| 后端 | FastAPI + PostgreSQL（独立部署，端口 8000） |
| 认证 | OAuth2 Password Flow + JWT Bearer Token |
| 包管理器 | npm |

---

## 2. 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3（Composition API + `<script setup>`） | ^3.5.25 |
| 语言 | TypeScript | ~5.9.3 |
| 构建 | Vite | ^7.3.1 |
| 路由 | vue-router（History 模式） | ^4.6.4 |
| HTTP | Axios + openapi-typescript-codegen 自动生成 | ^1.13.6 / ^0.30.0 |
| UI 组件 | Vant 4（移动端组件库） | ^4.9.22 |
| 图表 | ECharts | ^6.0.0 |
| 跨平台 | Capacitor（Android） | ^8.0.2 |
| 地理定位 | @capacitor/geolocation | ^8.0.0 |

---

## 3. 目录结构

```
guo-kang-yun-client/
├── .gitignore                    # Git 忽略规则
├── README.md                     # 项目说明
├── index.html                    # Vite 入口 HTML
├── package.json                  # 依赖与脚本
├── package-lock.json             # 依赖锁定
├── openapi.json                  # 后端 OpenAPI 规范（用于生成 API 客户端）
├── capacitor.config.ts           # Capacitor 跨平台配置
├── vite.config.ts                # Vite 构建配置
├── tsconfig.json                 # TypeScript 根配置
├── tsconfig.app.json             # 应用代码 TS 配置
├── tsconfig.node.json            # 构建工具 TS 配置
│
├── public/                       # 静态资源（直接复制到 dist）
│   └── vite.svg
│
├── docs/                         # 项目文档
│   ├── API_SUMMARY_FOR_FRONTEND.md
│   └── project-structure.md
│
├── document/                     # 开发日志与临时材料
│   ├── dev-deployment.md         # 开发部署说明
│   ├── dev-log.md                # 开发日志
│   ├── prod-deploy.md            # 生产部署说明
│   ├── generate-api.md           # API 代码生成说明
│   ├── note-page_router.md       # 路由设计笔记
│   ├── remember.md               # 开发备忘
│   ├── ai-chats/                  # AI 对话记录
│   └── temp-codes/               # 临时代码片段
│
├── android/                      # Capacitor Android 原生工程
│   ├── app/                      # Android 应用源码
│   ├── build.gradle              # 根构建脚本
│   ├── settings.gradle           # Gradle 设置
│   ├── variables.gradle          # 构建变量
│   ├── gradle.properties         # Gradle 属性
│   ├── gradlew / gradlew.bat     # Gradle Wrapper
│   └── capacitor-cordova-android-plugins/  # Cordova 兼容层
│
└── src/                          # 前端源码（核心）
    ├── main.ts                   # 应用入口（注册插件、配置 API）
    ├── App.vue                   # 根组件（路由出口 + Capacitor 返回键监听）
    ├── style.css                 # 全局样式
    ├── vite-env.d.ts             # Vite 类型声明
    │
    ├── layout/                   # 布局组件
    │   └── MainLayout.vue        # 主框架（底部 Tabbar + <router-view>）
    │
    ├── router/                   # 路由
    │   └── index.ts              # 路由表 + 导航守卫
    │
    ├── api/                      # API 层（自动生成）
    │   └── generated/
    │       ├── index.ts           # 统一导出入口
    │       ├── core/              # HTTP 请求基础设施
    │       │   ├── OpenAPI.ts     # 全局配置（BASE/TOKEN/HEADERS）
    │       │   ├── ApiError.ts    # API 错误类
    │       │   ├── ApiRequestOptions.ts  # 请求选项类型
    │       │   ├── ApiResult.ts   # 响应结果类型
    │       │   ├── CancelablePromise.ts  # 可取消 Promise
    │       │   └── request.ts     # 核心请求方法（基于 Axios）
    │       ├── models/            # 数据模型（TypeScript 类型）
    │       └── services/           # API 服务类
    │           ├── Service.ts      # 主要 API 端点（762 行，40+ 接口）
    │           └── DefaultService.ts # 根路径 /
    │
    ├── views/                      # 页面组件（24 个）
    │   ├── Login.vue               # 登录
    │   ├── Register.vue            # 注册
    │   ├── ForgotPassword.vue      # 找回密码
    │   ├── Home.vue                # 首页
    │   ├── PestList.vue            # 百科列表（病虫害）
    │   ├── PestDetail.vue          # 病虫害详情
    │   ├── Community.vue           # 社区首页
    │   ├── ArticleDetail.vue       # 文章详情
    │   ├── PostDetail.vue          # 帖子详情
    │   ├── PostCreate.vue          # 发布帖子
    │   ├── RecordList.vue          # 治理记录列表
    │   ├── RecordForm.vue          # 治理记录表单
    │   ├── RecordDetail.vue        # 治理记录详情
    │   ├── MessageList.vue         # 预警消息列表
    │   ├── MessageDetail.vue       # 预警消息详情
    │   ├── Profile.vue             # 个人中心
    │   ├── ProfileEdit.vue         # 编辑个人资料
    │   ├── AuditDashboard.vue      # 审核后台
    │   ├── AuditAction.vue         # 执行审核
    │   ├── ArticlePublish.vue      # 发布科普文章
    │   ├── WarningPublish.vue      # 发布预警
    │   ├── AdminPestList.vue       # 管理病虫害列表
    │   ├── AdminPestPost.vue       # 新增病虫害
    │   └── AdminPestEdit.vue       # 编辑病虫害
    │
    ├── components/                  # 可复用组件
    │   └── HelloWorld.vue          # 模板示例组件（可移除）
    │
    └── assets/                     # 静态资源（经过构建处理）
        └── vue.svg
```

---

## 4. 路由设计

### 4.1 路由模式

- 使用 `createWebHistory`（HTML5 History 模式）
- 所有需认证路由通过 `meta.requiresAuth: true` 标记
- 全局 `beforeEach` 守卫检查 `localStorage.token`，无 token 时跳转 `/login`

### 4.2 路由表

#### 独立页面（无底部导航栏）

| 路径 | 组件 | 认证 | 说明 |
|------|------|------|------|
| `/login` | Login | 否 | 登录页 |
| `/register` | Register | 否 | 注册页 |
| `/forgot-password` | ForgotPassword | 否 | 找回密码 |

#### 主框架（MainLayout + 底部 Tabbar）

| 路径 | 组件 | 认证 | keepAlive | Tab 图标 |
|------|------|------|-----------|----------|
| `/home` | Home | 是 | 是 | home-o 首页 |
| `/encyclopedia` | PestList | 是 | 是 | search 百科 |
| `/community` | Community | 是 | — | friends-o 社区 |
| `/profile` | Profile | 是 | — | user-o 我的 |

#### 业务详情页（无底部导航栏）

| 路径 | 组件 | 说明 |
|------|------|------|
| `/pest/detail/:id` | PestDetail | 病虫害详情 |
| `/record/list` | RecordList | 治理记录列表 |
| `/record/form` | RecordForm | 新增治理记录 |
| `/record/detail/:id` | RecordDetail | 治理记录详情 |
| `/article/detail/:id` | ArticleDetail | 文章详情 |
| `/post/detail/:id` | PostDetail | 帖子详情 |
| `/post/create` | PostCreate | 发布帖子 |
| `/message/list` | MessageList | 预警消息列表 |
| `/message/detail/:id` | MessageDetail | 预警消息详情 |
| `/profile/edit` | ProfileEdit | 编辑个人资料 |

#### 管理后台（需 ADMIN 角色）

| 路径 | 组件 | 说明 |
|------|------|------|
| `/admin/audit` | AuditDashboard | 待审核列表 |
| `/admin/audit/action/:id` | AuditAction | 执行审核 |
| `/admin/article-publish` | ArticlePublish | 发布科普文章 |
| `/admin/warning-publish` | WarningPublish | 发布预警 |
| `/admin/pest/list` | AdminPestList | 管理病虫害列表 |
| `/admin/pest/post` | AdminPestPost | 新增病虫害 |
| `/admin/pest/edit/:id` | AdminPestEdit | 编辑病虫害 |

---

## 5. 数据模型（TypeScript 类型）

所有模型定义在 `src/api/generated/models/`，由 `openapi-typescript-codegen` 自动生成。

### 5.1 核心实体

```typescript
// 用户
UserResponse {
  id: number
  email: string
  username: string
  role?: RoleEnum          // 0=FARMER, 1=EXPERT, 2=ADMIN
  phone?: string | null
  is_verified?: number
  create_at: string
}

// 病虫害
PestInfoResponse {
  id: number
  name: string
  category: PestCategoryEnum   // 病害 | 虫害 | 草害 | 鼠害
  affected_part?: string | null
  symptom_description?: string | null
  peak_season?: string | null
  typical_image?: string | null
  prevention_schemes?: PreventionSchemeResponse[]
}

// 防治方案
PreventionSchemeResponse {
  id: number
  pesticide_name: string
  recommended_dosage: string
  application_time: string
  operation_spec: string
}

// 治理记录
GovernanceRecordResponse {
  id: number
  user_id: number
  pest_type: string
  found_time: string
  location?: string | null
  status?: GovernanceStatusEnum   // in_progress | completed | cancelled
  description?: string | null
  photos?: string[] | null
}

// 科普文章
ArticleResponse {
  id: number
  title: string
  content: string
  category: string
  author_id: number
  status: ContentStatusEnum   // 待审核 | 已发布 | 已驳回
  views: number
  create_at: string
}

// 互动帖子
PostResponse {
  id: number
  title: string
  content: string
  category: string
  author_id: number
  status: ContentStatusEnum
  views: number
  create_at: string
}

// 预警消息
WarningMessageResponse {
  id: number
  level?: WarningLevelEnum   // 普通 | 紧急
  affected_scope: string
  prevention_measures: string
  publish_time: string
  expire_time: string
}
```

### 5.2 枚举一览

| 枚举 | 文件 | 值 |
|------|------|-----|
| `RoleEnum` | RoleEnum.ts | `_0`(FARMER), `_1`(EXPERT), `_2`(ADMIN) |
| `PestCategoryEnum` | PestCategoryEnum.ts | 病害 / 虫害 / 草害 / 鼠害 |
| `ContentStatusEnum` | ContentStatusEnum.ts | 待审核 / 已发布 / 已驳回 |
| `WarningLevelEnum` | WarningLevelEnum.ts | 普通 / 紧急 |
| `GovernanceStatusEnum` | GovernanceStatusEnum.ts | `in_progress`, `completed`, `cancelled` |

### 5.3 请求体模型

- `UserCreate` — 注册请求
- `UserProfileUpdate` — 修改资料
- `UserChangePassword` — 修改密码
- `PestInfoCreate` / `PestInfoUpdate` — 病虫害创建/更新
- `GovernanceRecordCreate` / `GovernanceRecordUpdate` — 治理记录创建/更新
- `ArticleCreate` / `PostCreate` — 文章/帖子发布
- `WarningMessageCreate` — 预警发布
- `AuditAction` — 审核请求
- `PasswordResetRequest` / `PasswordResetConfirm` — 密码重置两步
- `SendCodeRequest` — 发送验证码
- `Token` — 登录响应（access_token + token_type）

---

## 6. API 对接

### 6.1 配置方式

在 `src/main.ts` 中配置：

```typescript
// 后端地址（环境变量 VITE_API_BASE_URL，默认 localhost:8000）
OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

// Token 函数：每次请求前实时从 localStorage 读取
OpenAPI.TOKEN = async () => localStorage.getItem('token') || ''
```

### 6.2 API 端点一览

| 模块 | 前缀 | 端点数量 | 说明 |
|------|------|----------|------|
| 系统 | `/api/test-db` | 1 | 测试数据库连接 |
| 用户 | `/api/v1/users` | 9 | 注册/登录/密码/资料/角色管理 |
| 知识库 | `/api/v1/knowledge` | 5 | 病虫害 CRUD |
| 治理记录 | `/api/v1/governance` | 6 | 治理记录 CRUD |
| 社区 | `/api/v1/community` | 7 | 文章/帖子 + 审核 |
| 预警 | `/api/v1/warning` | 4 | 预警发布/查看/删除 |
| 上传 | `/api/v1/upload` | 2 | 单图/多图上传 |
| 点赞 | `/api/v1/like` | 3 | toggle/status/batch |
| 收藏 | `/api/v1/bookmark` | 4 | toggle/status/batch/me |
| 统计 | `/api/v1/statistics` | 4 | overview/popular/daily |

> 详细 API 文档参见 `docs/API_SUMMARY_FOR_FRONTEND.md` 和后端 Swagger `/api/docs`。

### 6.3 HTTP 请求流程

```
Vue 组件 → Service 静态方法 → request.ts (Axios)
    → OpenAPI.BASE + TOKEN → Authorization: Bearer xxx
    → 后端 FastAPI → JSON 响应
    ← Axios 拦截器（统一 401/403/404/500 处理）
```

### 6.4 Axios 全局拦截器

- **401** — 清除 token（可扩展自动跳转登录）
- **403** — 权限不足
- **404** — 资源不存在
- **500** — 服务器内部错误
- **网络错误** — 提示检查后端服务

---

## 7. 核心配置

### 7.1 Vite（vite.config.ts）

```typescript
export default defineConfig({
  plugins: [vue()],
})
```

极简配置，使用默认值。开发服务器可通过 `--host` 暴露到局域网。

### 7.2 TypeScript

- 根配置 `tsconfig.json` 通过 `references` 分拆为：
  - `tsconfig.app.json` — 应用代码，extends `@vue/tsconfig/tsconfig.dom.json`
  - `tsconfig.node.json` — 构建工具代码，target ES2023 + Node 类型
- 开启了 `strict` 模式、`noUnusedLocals`、`noUnusedParameters` 等严格检查

### 7.3 Capacitor（capacitor.config.ts）

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `appId` | `com.wawngjie2026.guokangyun` | Android 应用 ID |
| `appName` | 果康云 | 应用名 |
| `webDir` | `dist` | Web 构建产物目录 |
| `cleartext` | `true` | 允许 HTTP 明文请求 |
| `androidScheme` | `http` | Android 端请求协议 |

### 7.4 npm scripts

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器（--host，局域网可访问） |
| `npm run build` | 类型检查 + Vite 生产构建 |
| `npm run preview` | 预览生产构建 |
| `npm run dev:cap` | 同步 Capacitor 配置 |
| `npm run build:sync` | 构建并同步到 Android |
| `npm run build:cap` | 打开 Android Studio |
| `npm run generate-api` | 从 openapi.json 重新生成 API 客户端代码 |

---

## 8. 用户角色与权限

| 角色 | 值 | 说明 |
|------|-----|------|
| FARMER | 0 | 果农（默认注册角色）— 浏览内容、提交治理记录、发帖 |
| EXPERT | 1 | 专家 — 发布病虫害/预警/文章 |
| ADMIN | 2 | 管理员 — 审核内容、管理用户角色、删除数据 |

权限层级：FARMER < EXPERT < ADMIN

---

## 9. 数据流架构

```
┌──────────────────────────────────────────────┐
│                  Vue 3 SPA                     │
│                                                │
│ Views ──→ Service.ts ──→ request.ts (Axios)  │
│  │                         │                   │
│  │                         ▼                   │
│  │            OpenAPI.BASE + TOKEN             │
│  │                         │                   │
│  └── router/index.ts ──→ localStorage (token) │
│                                                │
├──────────────────────────────────────────────┤
│                HTTP/HTTPS                      │
│                                                │
│       FastAPI Backend (:8000)                  │
│       ├── JWT 认证                             │
│       ├── 角色权限控制                          │
│       └── PostgreSQL 数据库                     │
│                                                │
│ Capacitor WebView (Android)                    │
│ └── 内嵌 Web 资源 + 原生 API 桥接               │
└──────────────────────────────────────────────┘
```

---

## 10. 关键设计模式

### 10.1 API 代码生成

- 使用 `openapi-typescript-codegen` 从后端 `openapi.json` 生成
- 模型、枚举、Service 类全部自动生成，保证前后端类型一致
- 运行 `npm run generate-api` 即可更新

### 10.2 多态关联

点赞和收藏使用 `target_type` + `target_id` 通用模式：
- `target_type` → `"article"` | `"post"`
- 前端通过 `/batch` 批量查询状态，避免 N+1 请求

### 10.3 内容审核流

```
发布文章/帖子 → 默认状态 "待审核"
  → ADMIN 执行审核（通过/驳回）
    → "已发布" 内容在列表中可见
```

### 10.4 路由守卫

```typescript
router.beforeEach((to, _, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})
```

---

## 11. 构建与部署

### 11.1 Web 部署

```bash
npm run build          # 输出到 dist/
# 部署 dist/ 到任意静态文件服务器（Nginx / CDN）
```

### 11.2 Android 部署

```bash
npm run build          # 先构建 Web 资源
npm run build:sync     # 同步到 android/ 工程
npm run build:cap      # 打开 Android Studio 打包 APK
```

### 11.3 环境变量

| 变量 | 用途 | 默认值 |
|------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://127.0.0.1:8000` |

---

> 本文档由 DeepSeek TUI 分析项目源码后自动生成。项目源码注释均为中文，文档保持中文表述。
