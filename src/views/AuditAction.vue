<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast, showImagePreview } from 'vant'
import { Service } from '../api/generated'
import type { AuditAction } from '../api/generated'

const route = useRoute()
const router = useRouter()

// 路由参数：获取目标 ID 和类型 (post 或 article)
const targetId = Number(route.params.id)
const targetType = (route.query.type as string) || 'post'

// 页面状态
const detailInfo = ref<any>(null)
const loading = ref(true)
const submitting = ref(false)

// 驳回弹窗状态
const showRejectDialog = ref(false)
const rejectReason = ref('')

// ==================== 数据获取 ====================
const fetchDetail = async () => {
  loading.value = true
  try {
    // 【注意】由于没有单条获取接口，通过拉取待审核列表并在前端进行匹配
    const res = await Service.getPendingListApiV1CommunityAuditPendingGet(targetType, 0, 100)
    const dataList = Array.isArray(res) ? res : (res.data || [])
    const found = dataList.find((item: any) => item.id === targetId)

    if (found) {
      detailInfo.value = found
    } else {
      showToast('待审核内容不存在或已被处理')
      router.back()
    }
  } catch (error) {
    console.error('获取审核详情失败', error)
    showToast('获取数据失败，请检查网络')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (targetId) {
    fetchDetail()
  } else {
    showToast('参数错误')
    router.back()
  }
})

// ==================== 审核操作 ====================
// 封装通用的提交逻辑，根据最新的 AuditAction 类型修改参数
const submitAudit = async (isApproved: boolean, feedbackValue?: string) => {
  submitting.value = true
  try {
    // 严格按照 OpenAPI 生成的 AuditAction 类型进行组装
    const payload: AuditAction = {
      target_id: targetId,
      target_type: targetType,
      is_approved: isApproved, 
      feedback: feedbackValue || undefined
    }

    console.log('即将发送的审核数据:', payload)

    await Service.executeAuditActionApiV1CommunityAuditPost(payload)
    
    showSuccessToast(`已${isApproved ? '通过' : '驳回'}`)
    router.replace('/admin/audit') // 处理完毕后返回并刷新列表
    
  } catch (error: any) {
    // 【核心排错代码】：提取 FastAPI 抛出的精确校验错误
    if (error.body && error.body.detail) {
      console.error('🔴 详细校验错误:', JSON.stringify(error.body.detail, null, 2))
      showFailToast('参数格式不匹配，请查看控制台')
    } else {
      console.error('审核提交失败', error)
      showFailToast('操作失败，请检查网络')
    }
  } finally {
    submitting.value = false
  }
}

// 按钮点击：通过
const handleApprove = () => {
  // 通过审核，is_approved = true，可附带默认 feedback
  submitAudit(true, '审核通过')
}

// 按钮点击：唤起驳回弹窗
const onRejectClick = () => {
  rejectReason.value = ''
  showRejectDialog.value = true
}

// 弹窗确认：执行驳回 (拦截 cancel 和 confirm 操作)
const handleRejectConfirm = (action: string) => {
  // 如果用户点击了取消按钮，直接允许关闭弹窗
  if (action === 'cancel') {
    return true
  }

  // 如果点击确认，校验必须填写驳回原因
  if (!rejectReason.value.trim()) {
    showToast('请填写驳回原因')
    return false // 阻止弹窗关闭
  }
  
  // 驳回审核，is_approved = false
  submitAudit(false, rejectReason.value)
  return true
}

// ==================== 辅助功能 ====================
const onClickLeft = () => {
  router.back()
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未知时间'
  return new Date(dateStr).toLocaleString()
}

const previewImage = (index: number) => {
  const images = detailInfo.value?.photos || detailInfo.value?.images || []
  if (images.length > 0) {
    showImagePreview({ images, startPosition: index })
  }
}
</script>

<template>
  <div class="audit-action-container">
    <van-nav-bar 
      title="内容审核处理" 
      left-text="返回" 
      left-arrow 
      fixed 
      placeholder 
      border
      @click-left="onClickLeft" 
    />

    <van-skeleton title avatar :row="10" :loading="loading" class="skeleton-wrap">
      <div v-if="detailInfo" class="content-wrapper">
        
        <div class="audit-banner">
          <van-icon name="info-o" size="18" />
          <span>正在审核【{{ targetType === 'post' ? '果农交流帖' : '科普文章' }}】</span>
        </div>

        <div class="author-card van-hairline--bottom">
          <van-image
            class="avatar"
            round
            width="40"
            height="40"
            src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
          />
          <div class="meta">
            <span class="name">作者 ID: {{ detailInfo.author_id || '未知' }}</span>
            <span class="time">发布于 {{ formatDate(detailInfo.create_at) }}</span>
          </div>
        </div>

        <div class="main-content">
          <h2 class="title">{{ detailInfo.title || '无标题' }}</h2>
          <p class="desc">{{ detailInfo.content || detailInfo.description || '无详细内容' }}</p>
          
          <div class="photo-grid" v-if="detailInfo.photos || detailInfo.images">
            <van-image
              v-for="(img, idx) in (detailInfo.photos || detailInfo.images)"
              :key="idx"
              width="30vw"
              height="30vw"
              fit="cover"
              radius="6"
              :src="img"
              class="grid-img"
              @click="previewImage(Number(idx))"
            />
          </div>
        </div>

      </div>
    </van-skeleton>

    <van-action-bar v-if="!loading && detailInfo" class="custom-action-bar">
      <van-action-bar-button 
        class="custom-action-bar-btn-reject"
        type="danger" 
        text="驳回 (违规/不实)" 
        @click="onRejectClick" 
        plain
      />
      <van-action-bar-button 
        type="primary" 
        text="审核通过" 
        @click="handleApprove" 
        color="#07c160"
        :loading="submitting"
      />
    </van-action-bar>

    <van-dialog 
      v-model:show="showRejectDialog" 
      title="驳回原因" 
      show-cancel-button
      :before-close="handleRejectConfirm"
      confirm-button-color="#ee0a24"
    >
      <div class="dialog-content">
        <van-field
          v-model="rejectReason"
          type="textarea"
          rows="3"
          autosize
          maxlength="100"
          show-word-limit
          placeholder="请输入具体的驳回原因，将通知给发帖人..."
          class="reject-input"
        />
      </div>
    </van-dialog>

  </div>
</template>

<style scoped>
.audit-action-container {
  background-color: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 60px; /* 为 ActionBar 留出空间 */
}

.skeleton-wrap {
  margin-top: 20px;
}

.content-wrapper {
  background-color: #fff;
}

/* 顶部提示横幅 */
.audit-banner {
  background-color: #fffbe8;
  color: #ed6a0c;
  padding: 10px 16px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 用户信息 */
.author-card {
  display: flex;
  align-items: center;
  padding: 16px;
}

.meta {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 14px;
  font-weight: bold;
  color: #323233;
}

.time {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}

/* 正文 */
.main-content {
  padding: 16px;
}

.title {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #323233;
  line-height: 1.4;
}

.desc {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.grid-img {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* 底部操作栏 */
.custom-action-bar {
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  z-index: 100;
}

.custom-action-bar-btn-reject {
  color: #333;
}

/* 弹窗输入框 */
.dialog-content {
  padding: 16px;
}

.reject-input {
  background-color: #f7f8fa;
  border-radius: 8px;
}
</style>