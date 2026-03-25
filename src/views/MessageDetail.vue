<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { Service } from '../api/generated'
import type { WarningMessageResponse } from '../api/generated'

const route = useRoute()
const router = useRouter()

const messageId = Number(route.params.id)
const messageInfo = ref<WarningMessageResponse | null>(null)
const loading = ref(true)

// 获取消息详情 (已使用新接口)
const fetchMessageDetail = async () => {
  loading.value = true
  try {
    // 调用直接获取单条预警详情的接口
    const res = await Service.readWarningApiV1WarningWarningIdGet(messageId)

    if (res) {
      messageInfo.value = res
    } else {
      showToast('消息不存在或已过期')
      router.back()
    }
  } catch (error) {
    console.error('获取消息详情失败', error)
    // 后端抛出 404 等错误会进入这里
    showToast('获取消息失败或记录不存在')
    router.back()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (messageId) {
    fetchMessageDetail()
  } else {
    showToast('参数错误')
    router.back()
  }
})

// 返回上一页 (自动适应返回 /message/list 或 /home)
const onClickLeft = () => {
  router.back()
}

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未知时间'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 辅助函数：根据预警等级匹配 UI 样式 (与列表页保持一致)
const getLevelProps = (level?: string) => {
  switch (level) {
    case '红色':
    case 'RED':
      return { color: '#ee0a24', icon: 'warn', bgColor: '#fff1f0', borderColor: '#ffccc7' }
    case '橙色':
    case 'ORANGE':
      return { color: '#ff976a', icon: 'warning', bgColor: '#fff2e8', borderColor: '#ffd8bf' }
    case '黄色':
    case 'YELLOW':
      return { color: '#ffc21c', icon: 'info', bgColor: '#feffe6', borderColor: '#fff566' }
    case '蓝色':
    case 'BLUE':
      return { color: '#1989fa', icon: 'bulb', bgColor: '#e6f4ff', borderColor: '#91caff' }
    default:
      return { color: '#07c160', icon: 'volume', bgColor: '#f6ffed', borderColor: '#eaff8f' }
  }
}
</script>

<template>
  <div class="message-detail-container">
    <van-nav-bar 
      title="消息详情" 
      left-text="返回" 
      left-arrow 
      fixed 
      placeholder 
      border
      safe-area-inset-top @click-left="onClickLeft" 
    />

    <van-skeleton title avatar :row="10" :loading="loading" class="skeleton-wrap">
      <div v-if="messageInfo" class="message-content">
        
        <div 
          class="alert-banner"
          :style="{ 
            backgroundColor: getLevelProps(messageInfo.level as string).bgColor,
            borderColor: getLevelProps(messageInfo.level as string).borderColor
          }"
        >
          <div class="alert-header">
            <van-icon 
              :name="getLevelProps(messageInfo.level as string).icon" 
              :color="getLevelProps(messageInfo.level as string).color" 
              size="24" 
            />
            <span class="level-title" :style="{ color: getLevelProps(messageInfo.level as string).color }">
              {{ messageInfo.level }}预警通知
            </span>
          </div>
        </div>

        <div class="detail-card">
          <div class="meta-info van-hairline--bottom">
            <div class="meta-item">
              <span class="label">发布时间：</span>
              <span class="value">{{ formatDate(messageInfo.publish_time) }}</span>
            </div>
            <div class="meta-item">
              <span class="label">影响范围：</span>
              <span class="value scope-value">{{ messageInfo.affected_scope || '全局范围' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">过期时间：</span>
              <span class="value">{{ formatDate(messageInfo.expire_time) }}</span>
            </div>
          </div>

          <div class="main-text">
            <div class="text-title">预警内容与防范建议：</div>
            <p>{{ messageInfo.prevention_measures }}</p>
          </div>
        </div>
        
        <div class="official-signature">
          <p>果康云农业病虫害防汛指挥中心</p>
          <p>{{ formatDate(messageInfo.publish_time).split(' ')[0] }}</p>
        </div>

      </div>
    </van-skeleton>
  </div>
</template>

<style scoped>
/* 样式与原来完全一致，保持不变 */
.message-detail-container { background-color: #f7f8fa; min-height: 100vh; }
.skeleton-wrap { margin-top: 20px; }
.message-content { padding: 16px; }
.alert-banner { padding: 16px; border-radius: 8px; border-width: 1px; border-style: solid; margin-bottom: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02); }
.alert-header { display: flex; align-items: center; gap: 8px; }
.level-title { font-size: 20px; font-weight: bold; letter-spacing: 1px; }
.detail-card { background-color: #fff; border-radius: 8px; padding: 0 16px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); }
.meta-info { padding: 16px 0; display: flex; flex-direction: column; gap: 10px; }
.meta-item { display: flex; align-items: flex-start; font-size: 14px; }
.meta-item .label { color: #969799; min-width: 70px; }
.meta-item .value { color: #323233; flex: 1; }
.scope-value { font-weight: bold; }
.main-text { padding: 16px 0 24px 0; }
.text-title { font-size: 15px; font-weight: bold; color: #323233; margin-bottom: 12px; }
.main-text p { margin: 0; font-size: 15px; color: #333; line-height: 1.8; white-space: pre-wrap; word-wrap: break-word; }
.official-signature { margin-top: 30px; text-align: right; color: #969799; font-size: 13px; line-height: 1.6; padding-right: 10px; }
.official-signature p { margin: 0; }
</style>