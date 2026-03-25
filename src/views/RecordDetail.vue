<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import { Service } from '../api/generated'
import type { GovernanceRecordResponse } from '../api/generated'

// 获取真实后端地址
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const route = useRoute()
const router = useRouter()

const recordId = Number(route.params.id)
const recordInfo = ref<GovernanceRecordResponse | null>(null)
const loading = ref(true)

// 获取记录详情
const fetchRecordDetail = async () => {
  loading.value = true
  try {
    // 【注意】由于 API 没有提供直接获取单条记录的接口，这里拉取前100条进行过滤。
    // 如果后端补充了诸如 `readRecordById` 的接口，请替换为直接请求 ID 的方法。
    const res = await Service.readMyRecordsApiV1GovernanceMeGet(0, 100)
    const foundRecord = res.find(item => item.id === recordId)

    if (foundRecord) {
      recordInfo.value = foundRecord
    } else {
      showToast('未找到该记录或已被删除')
      router.replace('/record/list')
    }
  } catch (error) {
    console.error('获取详情失败', error)
    showToast('获取详情失败，请检查网络')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (recordId) {
    fetchRecordDetail()
  } else {
    showToast('参数错误')
    router.replace('/record/list')
  }
})

// 返回列表页
const onClickLeft = () => {
  router.push('/record/list')
}

// 去编辑页
const goToEdit = () => {
  if (recordId) {
    router.push(`/record/form?id=${recordId}`)
  }
}

// 辅助函数：格式化时间
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未知时间'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 辅助函数：获取完整图片真实地址
const getImageUrl = (url?: string) => {
  if (!url) return 'https://fastly.jsdelivr.net/npm/@vant/assets/tree.jpeg'
  if (url.startsWith('http')) return url
  
  const cleanBase = API_BASE.replace(/\/$/, '')
  const cleanUrl = url.startsWith('/') ? url : `/${url}`
  
  return `${cleanBase}${cleanUrl}`
}

// 辅助函数：解析状态
const getStatusProps = (status?: string) => {
  switch (status) {
    case 'completed':
      return { type: 'success', text: '已解决', icon: 'checked', color: '#07c160' }
    case 'in_progress':
      return { type: 'primary', text: '治理中', icon: 'clock', color: '#1989fa' }
    case 'cancelled':
      return { type: 'warning', text: '已取消', icon: 'close', color: '#ff976a' }
    default:
      return { type: 'default', text: '未知状态', icon: 'question', color: '#969799' }
  }
}

// 预览图片
const previewImage = (index: number) => {
  if (recordInfo.value?.photos && recordInfo.value.photos.length > 0) {
    // 映射出完整的真实图片地址数组，供预览组件使用
    const realImageUrls = recordInfo.value.photos.map(url => getImageUrl(url))
    
    showImagePreview({
      images: realImageUrls,
      startPosition: index
    })
  }
}
</script>

<template>
  <div class="record-detail-container">
    <van-nav-bar 
      title="治理记录详情" 
      left-text="返回" 
      left-arrow 
      fixed 
      placeholder 
      @click-left="onClickLeft"
    />

    <van-skeleton title :row="10" :loading="loading" class="skeleton-wrap">
      <div v-if="recordInfo" class="detail-content">
        
        <div class="status-banner" :style="{ backgroundColor: getStatusProps(recordInfo.status as string).color }">
          <div class="status-text">
            <van-icon :name="getStatusProps(recordInfo.status as string).icon" size="24" />
            <span>{{ getStatusProps(recordInfo.status as string).text }}</span>
          </div>
          <div class="status-date">创建于 {{ formatDate(recordInfo.found_time) }}</div>
        </div>

        <van-cell-group inset class="info-group">
          <van-cell title="病害类型" :value="recordInfo.pest_type || '未填写'" />
          <van-cell title="发现时间" :value="formatDate(recordInfo.found_time)" />
          <van-cell title="果园位置" :value="recordInfo.location || '未填写'" />
        </van-cell-group>

        <van-cell-group inset class="info-group">
          <div class="section-title">
            <van-icon name="label-o" /> 治理描述 / 使用药物
          </div>
          <div class="desc-content">
            {{ recordInfo.description || '该记录暂无详细描述' }}
          </div>
        </van-cell-group>

        <van-cell-group inset class="info-group">
          <div class="section-title">
            <van-icon name="photo-o" /> 现场照片
          </div>
          <div class="photo-grid" v-if="recordInfo.photos && recordInfo.photos.length > 0">
            <van-image
              v-for="(img, index) in recordInfo.photos"
              :key="index"
              width="80"
              height="80"
              fit="cover"
              radius="8"
              :src="getImageUrl(img)"
              class="grid-img"
              @click="previewImage(index)"
            />
          </div>
          <div class="empty-photo" v-else>
            <van-empty image-size="60" description="未上传照片" />
          </div>
        </van-cell-group>

      </div>
    </van-skeleton>

    <van-action-bar v-if="!loading && recordInfo">
      <van-action-bar-button 
        type="primary" 
        text="修改记录" 
        icon="edit"
        @click="goToEdit" 
        color="linear-gradient(to right, #4bb0ff, #07c160)"
      />
    </van-action-bar>
  </div>
</template>

<style scoped>
.record-detail-container {
  background-color: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 60px; /* 给底部 ActionBar 留出空间 */
}

.skeleton-wrap {
  margin-top: 20px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 顶部状态横幅 */
.status-banner {
  padding: 24px 20px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* 增加一个小阴影使层次分明 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 
}

.status-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: bold;
}

.status-date {
  font-size: 13px;
  opacity: 0.8;
}

/* 信息区块 */
.info-group {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.section-title {
  padding: 16px 16px 8px 16px;
  font-size: 15px;
  font-weight: bold;
  color: #323233;
  display: flex;
  align-items: center;
  gap: 6px;
}

.desc-content {
  padding: 0 16px 16px 16px;
  font-size: 14px;
  color: #646566;
  line-height: 1.6;
  white-space: pre-wrap; /* 保留输入时的换行符 */
}

/* 照片网格 */
.photo-grid {
  padding: 0 16px 16px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.grid-img {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.empty-photo {
  padding-bottom: 10px;
}

/* 修改 Van-cell 默认样式以适应展示 */
:deep(.van-cell__title) {
  color: #646566;
}
:deep(.van-cell__value) {
  color: #323233;
  font-weight: 500;
}
</style>