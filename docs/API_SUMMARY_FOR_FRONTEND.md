/# 果康云 后端 API 总览（前端开发用）

> 生成日期：2026-05-23 | 后端版本：最新 | 更新轮次：点赞/收藏/统计/权限

---

## 1. 项目概要

- **名称**：果康云（Guo Kang Yun）
- **定位**：农业病虫害管理平台
- **技术栈**：FastAPI + PostgreSQL + JWT 认证
- **Base URL**：`http://localhost:8000`
- **API 前缀**：`/api/v1/`
- **API 文档**：`/api/docs`（Swagger）、`/api/redoc`（ReDoc）
- **认证方式**：OAuth2 Password Flow + Bearer Token

---

## 2. 认证流程

### 2.1 获取 Token

```
POST /api/v1/users/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com    # OAuth2 规范中字段名为 username，实际传邮箱
password=yourpassword
```

响应：
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### 2.2 后续请求

所有需要认证的接口在 Header 中携带：

```
Authorization: Bearer eyJ...
```

### 2.3 Token 有效期

- 默认 7 天（可配置 `ACCESS_TOKEN_EXPIRE_MINUTES`）

---

## 3. 用户角色体系

| 角色 | 值 | 说明 |
|------|-----|------|
| `FARMER` | 0 | 果农（默认注册角色） |
| `EXPERT` | 1 | 专家 |
| `ADMIN` | 2 | 管理员 |

**权限层级**：FARMER < EXPERT < ADMIN

**权限规则**：
- 所有端点均需登录（除注册/登录/找回密码）
- 发布病虫害/预警 → EXPERT 或 ADMIN
- 审核内容/管理用户角色 → 仅 ADMIN

---

## 4. API 端点总览

### 4.1 用户模块 `/api/v1/users`

| 方法 | 路径 | 认证 | 权限 | 说明 |
|------|------|------|------|------|
| POST | `/send-register-code` | 无 | — | 发送注册验证码到邮箱 |
| POST | `/register` | 无 | — | 验证码校验 + 创建账号 |
| POST | `/forgot-password` | 无 | — | 发送重置密码验证码 |
| POST | `/reset-password` | 无 | — | 校验验证码 + 设置新密码 |
| POST | `/login` | 无 | — | 登录获取 JWT Token |
| GET | `/me` | Bearer | 登录 | 获取当前用户信息 |
| PUT | `/me` | Bearer | 登录 | 修改个人资料（昵称/手机） |
| PUT | `/change-password` | Bearer | 登录 | 修改密码（需旧密码） |
| GET | `/admin/list` | Bearer | ADMIN | 用户列表（支持筛选/搜索） |
| PUT | `/admin/{user_id}/role` | Bearer | ADMIN | 修改用户角色 |

**用户对象结构**：
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "张三",
  "role": "FARMER",
  "phone": "13800138000",
  "is_verified": 1,
  "create_at": "2026-01-01T00:00:00Z"
}
```

**管理员用户列表**（`GET /admin/list`）：
- 查询参数：`?role=FARMER&search=邮箱或昵称&skip=0&limit=20`
- `role` 可选值：`FARMER` / `EXPERT` / `ADMIN`
- `search`：对邮箱和昵称做模糊匹配（ILIKE）
- 返回：`{ items: [...], total: 100, skip: 0, limit: 20 }`

**修改角色**（`PUT /admin/{user_id}/role`）：
- 请求体：`{ "role": "EXPERT" }`
- 安全约束（由后端强制）：
  - ❌ 不能修改自己的角色
  - ❌ 不能修改其他 ADMIN 的角色
  - ❌ 不能将任何人设为 ADMIN
  - ✅ 只能将 FARMER ↔ EXPERT 互转

---

### 4.2 病虫害知识库 `/api/v1/knowledge`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/pests` | 登录 | 病虫害列表（分页） |
| GET | `/pests/{pest_id}` | 登录 | 病虫害详情 |
| POST | `/pests` | EXPERT+ | 发布病虫害 |
| PUT | `/pests/{pest_id}` | EXPERT+ | 更新病虫害 |
| DELETE | `/pests/{pest_id}` | ADMIN | 删除病虫害 |

**病虫害对象**：
```json
{
  "id": 1,
  "name": "稻瘟病",
  "category": "病害",
  "affected_part": "叶片",
  "symptom_description": "叶片出现梭形病斑...",
  "peak_season": "6-8月",
  "typical_image": "/static/uploads/xxx.jpg",
  "prevention_schemes": [
    {
      "id": 1,
      "pesticide_name": "三环唑",
      "recommended_dosage": "75%可湿性粉剂 20-30g/亩",
      "application_time": "发病初期",
      "operation_spec": "兑水50kg均匀喷雾"
    }
  ]
}
```

---

### 4.3 治理记录 `/api/v1/governance`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/` | 登录 | 提交治理记录（附照片） |
| GET | `/me` | 登录 | 我的治理记录（分页） |
| GET | `/all` | EXPERT+ | 所有人的治理记录 |
| GET | `/{record_id}` | 登录 | 记录详情（果农仅看自己的） |
| PUT | `/{record_id}` | 登录 | 更新自己的记录 |
| DELETE | `/{record_id}` | 登录 | 删除自己的记录 |

**治理记录对象**：
```json
{
  "id": 1,
  "user_id": 1,
  "pest_type": "稻瘟病",
  "found_time": "2026-05-20T08:00:00Z",
  "location": "村东头三亩地",
  "status": "in_progress",
  "description": "发现叶片有斑点",
  "photos": ["/static/uploads/1.jpg", "/static/uploads/2.jpg"]
}
```

---

### 4.4 社区（文章 & 帖子） `/api/v1/community`

#### 科普文章

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/articles` | 登录 | 已发布文章列表 |
| GET | `/articles/{id}` | 登录 | 文章详情（浏览量+1） |
| POST | `/articles` | EXPERT+ | 发布文章（默认待审核） |

#### 互动帖子

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/posts` | 登录 | 已发布帖子列表 |
| GET | `/posts/{id}` | 登录 | 帖子详情（浏览量+1） |
| POST | `/posts` | 登录 | 发帖（默认待审核） |

#### 审核

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/audit/pending?target_type=article` | ADMIN | 待审核列表 |
| POST | `/audit` | ADMIN | 执行审核 |

**文章/帖子对象**：
```json
{
  "id": 1,
  "title": "水稻病虫害防治指南",
  "content": "正文内容...",
  "category": "水稻",
  "author_id": 2,
  "status": "已发布",
  "views": 128,
  "create_at": "2026-05-15T10:00:00Z"
}
```

**审核请求体**：
```json
{
  "target_id": 1,
  "target_type": "article",
  "is_approved": true,
  "feedback": "内容质量好，通过"
}
```

---

### 4.5 预警通知 `/api/v1/warning`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/` | EXPERT+ | 发布预警（后台群发邮件） |
| GET | `/active` | 登录 | 当前生效的预警列表 |
| GET | `/{warning_id}` | 登录 | 预警详情 |
| DELETE | `/{warning_id}` | EXPERT+ | 撤销预警 |

**预警对象**：
```json
{
  "id": 1,
  "level": "紧急",
  "affected_scope": "全县水稻种植区",
  "prevention_measures": "立即喷洒三环唑...",
  "publish_time": "2026-05-23T08:00:00Z",
  "expire_time": "2026-05-30T08:00:00Z"
}
```

---

### 4.6 文件上传 `/api/v1/upload`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/image` | 登录 | 单图上传 |
| POST | `/images` | 登录 | 多图上传 |

**单图上传**：FormData，字段名 `file`
```json
// 响应
{ "image_url": "/static/uploads/abc123.jpg" }
```

**多图上传**：FormData，字段名 `files`（可多选）
```json
// 响应
{ "image_urls": ["/static/uploads/1.jpg", "/static/uploads/2.jpg"] }
```

⚠️ **前端注意**：图片 URL 是相对路径，访问时需要拼接完整地址，如 `http://localhost:8000/static/uploads/abc123.jpg`

---

### 4.7 点赞互动 🆕 `/api/v1/like`

`target_type` 可选值：`article` / `post`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/toggle` | 登录 | 点赞/取消点赞（toggle） |
| GET | `/status?target_type=article&target_id=1` | 登录 | 查询点赞状态 + 总数 |
| POST | `/batch` | 登录 | 批量查询点赞状态 |

**toggle 请求/响应**：
```json
// 请求
{ "target_type": "article", "target_id": 1 }

// 响应
{ "liked": true, "like_count": 5 }
```

**status 响应**：
```json
{ "liked": true, "like_count": 5 }
```

**batch 请求/响应**：
```json
// 请求
{ "target_type": "article", "target_ids": [1, 2, 3, 4, 5] }

// 响应
{ "target_type": "article", "liked_target_ids": [1, 3, 5] }
```

**前端使用模式**：
1. 文章列表页加载后，提取所有文章 ID，调 `/batch` 一次性获取点赞状态
2. 列表中每个条目的 ❤️ 按钮根据 `liked_target_ids` 高亮
3. 点击 ❤️ 调 `/toggle`，切换后更新本地状态

---

### 4.8 收藏管理 🆕 `/api/v1/bookmark`

`target_type` 可选值：`article` / `post`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/toggle` | 登录 | 收藏/取消收藏（toggle） |
| GET | `/status?target_type=article&target_id=1` | 登录 | 查询收藏状态 |
| POST | `/batch` | 登录 | 批量查询收藏状态 |
| GET | `/me?target_type=article&skip=0&limit=20` | 登录 | 我的收藏列表（分页+筛选） |

**toggle 请求/响应**：
```json
// 请求
{ "target_type": "article", "target_id": 1 }

// 响应
{ "bookmarked": true }
```

**我的收藏列表响应**：
```json
{
  "items": [
    { "id": 1, "target_type": "article", "target_id": 5, "created_at": "2026-05-23T10:00:00Z" },
    { "id": 2, "target_type": "post", "target_id": 3, "created_at": "2026-05-22T09:00:00Z" }
  ],
  "total": 25,
  "skip": 0,
  "limit": 20
}
```

**收藏管理页前端策略**：
1. 列表项返回 `target_type` + `target_id`，前端需要根据类型分别调对应详情接口
2. 例如收藏了 article id=5 → 调 `GET /api/v1/community/articles/5` 获取标题和摘要

---

### 4.9 数据统计 🆕 `/api/v1/statistics`

所有端点均需登录。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/overview` | 平台总览 |
| GET | `/popular/articles?limit=10` | 热门文章（按浏览量） |
| GET | `/popular/by-likes?target_type=article&limit=10` | 热门内容（按点赞数） |
| GET | `/daily` | 今日新增数据 |

**总览响应**：
```json
{
  "total_users": 150,
  "total_articles": 42,
  "total_posts": 88,
  "total_governance_records": 230,
  "total_warnings": 12,
  "total_pests": 35,
  "pending_articles": 3,
  "pending_posts": 7
}
```

**热门文章响应**：
```json
[
  { "id": 1, "title": "...", "views": 256, "create_at": "...", "author_id": 2 },
  { "id": 5, "title": "...", "views": 189, "create_at": "...", "author_id": 3 }
]
```

**每日统计响应**：
```json
{
  "date": "2026-05-23T00:00:00Z",
  "new_users": 5,
  "new_articles": 2,
  "new_posts": 8,
  "new_governance_records": 12
}
```

---

## 5. 关键设计模式

### 5.1 多态关联（Like / Bookmark）

点赞和收藏使用 `target_type` + `target_id` 的通用模式，同一张表覆盖多种内容类型：

```
likes/bookmarks
  ├── user_id     → users.id (外键，级联删除)
  ├── target_type → "article" | "post"
  └── target_id   → 目标记录的主键 ID
```

**唯一约束**：`(user_id, target_type, target_id)` — 每个用户对每个目标只能点赞/收藏一次。

**toggle 行为**：
- 未点赞 → 点赞（创建记录）
- 已点赞 → 取消（删除记录）
- 并发安全：数据库层 ON CONFLICT 防重复

**前端需要做**：
- 列表页通过 `/batch` 批量查询已点赞/收藏的 ID 集合
- 详情页通过 `/status` 查询单个状态
- 用户自己的收藏列表通过 `/bookmark/me` 获取

### 5.2 权限检查链

```
请求 → get_current_user（JWT 解析）
     → RoleChecker（角色校验，可选）
     → 业务逻辑
```

- `get_current_user`：从 Bearer Token 解析用户 → 任何登录用户
- `RoleChecker([EXPERT, ADMIN])`：专家或管理员
- `RoleChecker([ADMIN])`：仅管理员

---

## 6. 重要约束和已知行为

| 事项 | 说明 |
|------|------|
| 登录接口 | 使用 OAuth2 规范，表单字段名为 `username`，实际传入**邮箱** |
| 内容审核 | 新建文章/帖子默认为 `"待审核"` 状态，管理员审核后变为 `"已发布"` |
| 列表接口 | 仅返回 `status == "已发布"` 的内容 |
| 图片上传 | Content-Type: `multipart/form-data`，字段名 `file`（单图）或 `files`（多图） |
| Token 过期 | 返回 401，前端需跳转登录页 |
| 403 | 权限不足，当前角色无法执行该操作 |
| 400 | 参数校验失败（含业务约束，如修改角色时的安全拦截） |
| 浏览量 | 调用文章/帖子详情接口时自动 +1 |
| 邮件 | 预警发布后后台异步群发邮件，前端无需处理 |
| **无内容删除端点** | 当前文章和帖子没有 DELETE 端点，仅通过审核控制发布状态 |

---

## 7. 建议的前端页面结构

| 页面 | 路由 | 对接 API |
|------|------|---------|
| 登录/注册 | `/login` `/register` | `users` 模块 |
| 首页/仪表盘 | `/dashboard` | `statistics/overview` + `statistics/daily` |
| 知识库 | `/knowledge` | `knowledge/pests`（列表+详情） |
| 治理记录 | `/governance` | `governance`（CRUD + 图片上传） |
| 社区文章 | `/articles` | `community/articles` + `like` + `bookmark` |
| 社区帖子 | `/posts` | `community/posts` + `like` + `bookmark` |
| 预警中心 | `/warnings` | `warning` |
| 收藏管理 | `/bookmarks` | `bookmark/me` → 按类型查详情 |
| 统计报表 | `/stats` | `statistics` 全部端点 |
| 管理后台 | `/admin` | `users/admin/*` + `community/audit/*` |
| 个人中心 | `/profile` | `users/me` + `change-password` |

---

## 8. 快速启动

```bash
# 后端（已运行中）
cd /opt/guo-kang-yun-server
./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# API 文档
open http://localhost:8000/api/docs
```
