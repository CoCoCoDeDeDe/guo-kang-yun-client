<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showImagePreview, showConfirmDialog } from 'vant'
import { Service } from '../api/generated'
import type { GovernanceRecordResponse } from '../api/generated'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const route = useRoute()
const router = useRouter()

const recordId = Number(route.params.id)
const recordInfo = ref<GovernanceRecordResponse | null>(null)
const loading = ref(true)

const fetchRecordDetail = async () => {
  loading.value = true
  try {
    const res = await Service.readGovernanceRecordApiV1GovernanceRecordIdGet(recordId)
    if (res) { recordInfo.value = res }
    else { showToast('记录不存在'); router.replace('/record/list') }
  } catch (error) {
    console.error('获取详情失败', error)
    showToast('获取详情失败')
    router.replace('/record/list')
  } finally { loading.value = false }
}

onMounted(() => {
  if (recordId) fetchRecordDetail()
  else { showToast('参数错误'); router.replace('/record/list') }
})

const onClickLeft = () => router.push('/record/list')
const goToEdit = () => { if (recordId) router.push(`/record/form?id=${recordId}`) }

const deleteRecord = async () => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这条治理记录吗？删除后不可恢复。'
    })
  } catch { return }
  try {
    await Service.deleteGovernanceRecordApiV1GovernanceRecordIdDelete(recordId)
    showToast('已删除')
    router.replace('/record/list')
  } catch (error) {
    console.error('删除失败', error)
    showToast('删除失败')
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未知时间'
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const getImageUrl = (url?: string) => {
  if (!url) return 'https://fastly.jsdelivr.net/npm/@vant/assets/tree.jpeg'
  if (url.startsWith('http')) return url
  const base = API_BASE.replace(/\/$/, '')
  const u = url.startsWith('/') ? url : `/${url}`
  return `${base}${u}`
}

const getStatusProps = (status?: string) => {
  switch (status) {
    case 'completed': return { type: 'success', text: '已解决', icon: 'checked', color: '#10b981' }
    case 'in_progress': return { type: 'primary', text: '治理中', icon: 'clock', color: '#3b82f6' }
    case 'cancelled': return { type: 'warning', text: '已取消', icon: 'close', color: '#f59e0b' }
    default: return { type: 'default', text: '未知', icon: 'question', color: '#94a3b8' }
  }
}

const previewImage = (index: number) => {
  const photos = recordInfo.value?.photos
  if (photos?.length) {
    showImagePreview({ images: photos.map(getImageUrl), startPosition: index })
  }
}
</script>

<template>
  <div class="record-detail-container">
    <van-nav-bar title="治理记录详情" left-text="返回" left-arrow fixed placeholder safe-area-inset-top @click-left="onClickLeft" />

    <van-skeleton title :row="10" :loading="loading" class="skeleton-wrap">
      <div v-if="recordInfo" class="detail-content">
        <div class="status-banner" :style="{ background: getStatusProps(recordInfo.status as string).color }">
          <div class="status-text">
            <van-icon :name="getStatusProps(recordInfo.status as string).icon" size="22" />
            <span>{{ getStatusProps(recordInfo.status as string).text }}</span>
          </div>
          <div class="status-date">创建于 {{ formatDate(recordInfo.found_time) }}</div>
        </div>

        <van-cell-group inset>
          <van-cell title="病害类型" :value="recordInfo.pest_type || '未填写'" />
          <van-cell title="发现时间" :value="formatDate(recordInfo.found_time)" />
          <van-cell title="果园位置" :value="recordInfo.location || '未填写'" />
        </van-cell-group>

        <van-cell-group inset>
          <div class="section-hd"><van-icon name="label-o" /> 治理描述</div>
          <div class="section-body">{{ recordInfo.description || '暂无详细描述' }}</div>
        </van-cell-group>

        <van-cell-group inset>
          <div class="section-hd"><van-icon name="photo-o" /> 现场照片</div>
          <div class="photo-grid" v-if="recordInfo.photos?.length">
            <van-image v-for="(img, i) in recordInfo.photos" :key="i"
              width="80" height="80" fit="cover" radius="8"
              :src="getImageUrl(img)" class="grid-img" @click="previewImage(i)" />
          </div>
          <van-empty v-else image-size="60" description="未上传照片" />
        </van-cell-group>
      </div>
    </van-skeleton>

    <van-action-bar v-if="!loading && recordInfo" :safe-area-inset-bottom="true">
      <van-action-bar-button type="danger" text="删除记录" icon="delete-o" @click="deleteRecord" />
      <van-action-bar-button type="primary" text="修改记录" icon="edit" @click="goToEdit"
        color="linear-gradient(135deg, #10b981, #0d9488)" />
    </van-action-bar>
  </div>
</template>

<style scoped>
.record-detail-container { background: var(--color-bg); min-height: 100vh; padding-bottom: 60px; }
.skeleton-wrap { margin-top: 20px; }
.detail-content { display: flex; flex-direction: column; gap: 14px; }

.status-banner {
  padding: 28px 20px; color: #fff; display: flex;
  justify-content: space-between; align-items: center;
  box-shadow: 0 4px 16px rgba(0,0,0,.12);
}
.status-text { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; }
.status-date { font-size: 13px; opacity: .8; }

.section-hd {
  padding: 14px 16px 6px; font-size: 14px; font-weight: 600;
  color: var(--color-text-primary); display: flex; align-items: center; gap: 6px;
}
.section-body {
  padding: 0 16px 14px; font-size: 14px; color: var(--color-text-secondary);
  line-height: 1.7; white-space: pre-wrap;
}
.photo-grid { padding: 6px 16px 14px; display: flex; flex-wrap: wrap; gap: 8px; }
.grid-img { box-shadow: 0 2px 6px rgba(0,0,0,.08); }
</style>
