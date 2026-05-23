# 后端 API 更新 → 前端同步实施计划

> 创建：2026-05-23 | 状态：✅ 已完成 | 依据：`docs/API_SUMMARY_FOR_FRONTEND.md`（2026-05-23 更新轮次）

---

## 更新来源

后端本轮新增 3 个模块（点赞 / 收藏 / 统计），同时权限管理 API 已就绪。前端已完成同步：

1. **点赞功能** — 文章/帖子/已发布内容支持点赞 ✅
2. **收藏功能** — 文章/帖子/已发布内容支持收藏 + 收藏管理页 ✅
3. **权限管理** — 管理员可管理用户角色 ✅
4. **美化页面** — 视觉升级，专业高级感 ✅
5. **统计页面** — 数据总览 / 热门排行 / 今日新增 ✅

---

## 实施步骤

### 阶段 A：基础设施更新

| # | 任务 | 状态 | 涉及文件 |
|---|------|------|----------|
| 1 | 更新 `openapi.json` — 补充 like / bookmark / statistics 三模块 paths + schemas | ✅ 完成 | `openapi.json` |
| 2 | 重新生成 API 客户端 — `npm run generate-api` | ✅ 完成 | `src/api/generated/**/*` |

### 阶段 B：点赞 & 收藏

| # | 任务 | 状态 | 涉及文件 |
|---|------|------|----------|
| 3 | 点赞集成 — toggle + status + batch | ✅ 完成 | `ArticleDetail.vue` `PostDetail.vue` `Community.vue` |
| 4 | 收藏集成 — toggle + status + batch | ✅ 完成 | 同上 |
| 5 | 收藏管理页 — `BookmarkList.vue` + 路由 | ✅ 完成 | 新建 `src/views/BookmarkList.vue` `src/router/index.ts` |

### 阶段 C：统计 & 权限

| # | 任务 | 状态 | 涉及文件 |
|---|------|------|----------|
| 6 | 数据统计页 — overview / popular / daily | ✅ 完成 | 新建 `src/views/Statistics.vue` `src/router/index.ts` |
| 7 | 权限管理页 — 用户列表 + 搜索 + 角色修改 | ✅ 完成 | 新建 `src/views/AdminUsers.vue` `src/router/index.ts` |

### 阶段 D：视觉升级

| # | 任务 | 状态 | 涉及文件 |
|---|------|------|----------|
| 8 | 全局 UI 美化 — 配色/卡片/阴影/过渡 | ✅ 完成 | `src/style.css` + `src/views/Profile.vue` |

---

## 进度追踪

| 指标 | 数值 |
|------|------|
| 总步骤 | 8 |
| 已完成 | 8 |
| 进度 | 100% |

---

## 变更清单

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/views/BookmarkList.vue` | 收藏管理页（分页 + 左滑取消收藏） |
| `src/views/Statistics.vue` | 数据统计页（今日/总览/热门排行） |
| `src/views/AdminUsers.vue` | 用户管理页（搜索/筛选/角色修改） |

### 修改文件

| 文件 | 变更 |
|------|------|
| `openapi.json` | 新增 like/bookmark/statistics/users-admin 共 13 个路径 + 20 个 schema |
| `src/api/generated/**/*` | 自动生成新模型和 Service 方法 |
| `src/views/ArticleDetail.vue` | 底部 ActionBar 增加点赞/收藏按钮 |
| `src/views/PostDetail.vue` | 底部 ActionBar 增加点赞/收藏/评论按钮 |
| `src/views/Community.vue` | 列表卡片增加点赞/收藏图标（batch 查询） |
| `src/views/Profile.vue` | 增加「我的收藏」「数据统计」「用户管理」入口，修复退出登录 key |
| `src/router/index.ts` | 新增 3 条路由：/bookmarks /statistics /admin/users |
| `src/style.css` | 全面重写：CSS 变量设计系统、Vant 组件覆写、工具类 |

---

> 本文档随实施进度实时更新。每完成一步即更新对应行的状态标记。
