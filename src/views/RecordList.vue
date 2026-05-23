<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { Service } from '../api/generated'
import type { GovernanceRecordResponse } from '../api/generated'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const router = useRouter()

const list = ref<GovernanceRecordResponse[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

let skip = 0
const limit = 10

const onLoad = async () => {
  if (finished.value) return
  try {
    loading.value = true
    const res = await Service.readMyRecordsApiV1GovernanceMeGet(skip, limit)
    if (refreshing.value) { list.value = res; refreshing.value = false }
    else { list.value.push(...res) }
    skip += limit
    if (res.length < limit) finished.value = true
  } catch (error) {
    console.error('获取治理记录失败', error)
    finished.value = true
  } finally { loading.value = false }
}

const onRefresh = () => {
  finished.value = false; skip = 0; refreshing.value = true; onLoad()
}

const onClickLeft = () => router.push('/profile')
const goToForm = () => router.push('/record/form')
const goToDetail = (id: number) => router.push(`/record/detail/${id}`)

const deleteRecord = async (item: GovernanceRecordResponse, index: number) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除「${item.pest_type}」这条治理记录吗？删除后不可恢复。`
    })
  } catch { return }

  try {
    await Service.deleteGovernanceRecordApiV1GovernanceRecordIdDelete(item.id!)
    list.value.splice(index, 1)
    showToast('已删除')
  } catch (error) {
    console.error('删除失败', error)
    showToast('删除失败，请稍后重试')
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未知时间'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

const getImageUrl = (url?: string) => {
  if (!url) return 'https://fastly.jsdelivr.net/npm/@vant/assets/tree.jpeg'
  if (url.startsWith('http')) return url
  const cleanBase = API_BASE.replace(/\/$/, '')
  const cleanUrl = url.startsWith('/') ? url : `/${url}`
  return `${cleanBase}${cleanUrl}`
}

const getStatusProps = (status?: string) => {
  switch (status) {
    case 'completed': return { type: 'success', text: '已解决', color: '#10b981' }
    case 'in_progress': return { type: 'primary', text: '治理中', color: '#3b82f6' }
    case 'cancelled': return { type: 'warning', text: '已取消', color: '#f59e0b' }
    default: return { type: 'default', text: '未知', color: '#94a3b8' }
  }
}
</script>

<template>
  <div class="record-list-container">
    <van-nav-bar title="我的治理记录" left-text="返回" left-arrow fixed placeholder safe-area-inset-top @click-left="onClickLeft">
      <template #right>
        <van-icon name="plus" size="18" @click="goToForm" />
      </template>
    </van-nav-bar>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="pull-refresh-wrap">
      <van-empty v-if="list.length === 0 && !loading && !refreshing" description="暂无治理记录" />

      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多记录了" @load="onLoad">
        <div class="list-wrapper">
          <van-swipe-cell v-for="(item, index) in list" :key="item.id">
            <div
              class="record-card"
              @click="goToDetail(item.id!)"
              :style="{ '--bar-color': getStatusProps(item.status as string).color }"
            >
              <div class="card-header">
                <span class="date"><van-icon name="clock-o" /> {{ formatDate(item.found_time) }}</span>
                <van-tag :type="getStatusProps(item.status as string).type as any" plain>
                  {{ getStatusProps(item.status as string).text }}
                </van-tag>
              </div>
              <div class="card-body">
                <div class="info-content">
                  <h3 class="title">{{ item.pest_type || '未指定' }}</h3>
                  <p class="desc">{{ item.location || '未填写位置' }}</p>
                  <p class="desc text-muted">{{ item.description || '暂无描述' }}</p>
                </div>
                <van-image class="thumb" width="70" height="70" radius="8" fit="cover" :src="getImageUrl(item.photos?.[0])" />
              </div>
              <div class="card-footer">
                <span class="view-detail">查看详情 <van-icon name="arrow" /></span>
              </div>
            </div>
            <template #right>
              <van-button square type="danger" text="删除" class="swipe-btn" @click="deleteRecord(item, index)" />
            </template>
          </van-swipe-cell>
        </div>
      </van-list>
    </van-pull-refresh>

    <div class="fab-button" @click="goToForm">
      <van-icon name="edit" />
    </div>
  </div>
</template>

<style scoped>
.record-list-container { background: var(--color-bg); min-height: 100vh; }
.pull-refresh-wrap { min-height: calc(100vh - 46px); }
.list-wrapper { padding: 12px 16px; }

.swipe-btn { height: 100%; border-radius: 0; }

.record-card {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  position: relative;
}
.record-card::before {
  content: '';
  position: absolute; left: 0; top: 12px; bottom: 12px;
  width: 4px; border-radius: 2px;
  background: var(--bar-color, #10b981);
}
.card-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px 0;
}
.date { font-size: 13px; color: var(--color-text-muted); display: flex; align-items: center; gap: 4px; }
.card-body { display: flex; padding: 12px 16px; gap: 12px; }
.info-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.title { margin: 0 0 6px; font-size: 16px; font-weight: 600; color: var(--color-text-primary); }
.desc { margin: 0 0 4px; font-size: 13px; color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.thumb { flex-shrink: 0; border-radius: 8px; }
.card-footer { padding: 10px 16px 12px; text-align: right; }
.view-detail { font-size: 13px; color: var(--color-primary); display: inline-flex; align-items: center; }

.fab-button {
  position: fixed; right: 20px; bottom: 40px;
  width: 50px; height: 50px; border-radius: 16px;
  background: var(--color-primary-gradient);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 22px; box-shadow: 0 6px 20px rgba(16,185,129,.35);
  z-index: 99; transition: transform var(--transition-fast);
}
.fab-button:active { transform: scale(.9); }
</style>
