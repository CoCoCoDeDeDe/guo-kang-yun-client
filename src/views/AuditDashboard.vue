<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { Service } from '../api/generated'

const router = useRouter()

// 定义目标类型，对应后端的 target_type 参数
// 假设后端接受 'post' 代表帖子，'article' 代表文章
const activeTab = ref('post')

const list = ref<any[]>([]) // API 中 getPendingList 暂定返回 any，可根据实际后端数据结构定义 interface
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

let skip = 0
const limit = 10

// 加载待审核数据
const onLoad = async () => {
  if (finished.value) return

  try {
    loading.value = true
    // 调用 API，传入当前选中的 target_type，以及分页参数
    const res = await Service.getPendingListApiV1CommunityAuditPendingGet(activeTab.value, skip, limit)

    // 假设后端返回的是数组，如果后端包了一层 (例如 res.data)，请替换为 res.data
    const data = Array.isArray(res) ? res : (res.data || [])

    if (refreshing.value) {
      list.value = data
      refreshing.value = false
    } else {
      list.value.push(...data)
    }

    skip += limit
    if (data.length < limit) {
      finished.value = true
    }
  } catch (error) {
    console.error('获取待审核列表失败', error)
    finished.value = true
    showToast('获取数据失败，请检查网络')
  } finally {
    loading.value = false
  }
}

// 刷新列表 (下拉刷新或切换 Tab 时触发)
const onRefresh = () => {
  finished.value = false
  skip = 0
  refreshing.value = true
  onLoad()
}

// 监听 Tab 切换，自动刷新当前类型的数据
watch(activeTab, () => {
  // 清空当前列表并显示加载动画
  list.value = []
  onRefresh()
})

// 返回个人中心
const onClickLeft = () => {
  router.push('/profile')
}

// 去往具体审核操作页
const goToAuditAction = (id: number) => {
  // 携带当前内容的 ID 和 Type 跳转至审核详情页
  router.push({
    path: `/admin/audit/action/${id}`,
    query: { type: activeTab.value }
  })
}

// 格式化时间辅助函数
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未知时间'
  return new Date(dateStr).toLocaleString()
}
</script>

<template>
  <div class="audit-dashboard-container">
    <van-nav-bar 
      title="审核工作台" 
      left-text="返回" 
      left-arrow 
      fixed 
      placeholder 
      border
      @click-left="onClickLeft" 
    />

    <van-tabs v-model:active="activeTab" sticky offset-top="46px" color="#ee0a24">
      <van-tab title="帖子审核" name="post" />
      <van-tab title="科普文章审核" name="article" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="pull-refresh-wrap">
      
      <van-empty v-if="list.length === 0 && !loading && !refreshing" description="当前没有待审核内容" />

      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多待审核内容了"
        @load="onLoad"
      >
        <div class="list-wrapper">
          <div 
            v-for="item in list" 
            :key="item.id" 
            class="audit-card"
            @click="goToAuditAction(item.id)"
          >
            <div class="card-header van-hairline--bottom">
              <span class="type-tag">
                <van-tag type="danger" plain>待审核</van-tag>
              </span>
              <span class="time">{{ formatDate(item.create_at) }}</span>
            </div>
            
            <div class="card-body">
              <h3 class="title">{{ item.title || '无标题' }}</h3>
              <p class="content van-multi-ellipsis--l2">
                {{ item.content || item.description || '无内容摘要' }}
              </p>
              
              <div class="author">
                <van-icon name="user-o" /> 作者ID: {{ item.author_id || '未知' }}
              </div>
            </div>
            
            <div class="card-footer">
              <van-button type="danger" size="small" round plain class="audit-btn">
                前往处理
              </van-button>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<style scoped>
.audit-dashboard-container {
  background-color: #f7f8fa;
  min-height: 100vh;
}

.pull-refresh-wrap {
  min-height: calc(100vh - 90px);
}

.list-wrapper {
  padding: 12px;
}

/* 卡片样式 */
.audit-card {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

/* 左侧红条装饰，体现警示感 */
.audit-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #ee0a24;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.card-header .time {
  font-size: 12px;
  color: #969799;
}

.card-body {
  padding: 12px 16px;
}

.card-body .title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: bold;
  color: #323233;
}

.card-body .content {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
}

.card-body .author {
  font-size: 12px;
  color: #969799;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-footer {
  padding: 10px 16px;
  background-color: #fafafa;
  display: flex;
  justify-content: flex-end;
}

.audit-btn {
  padding: 0 20px;
}
</style>