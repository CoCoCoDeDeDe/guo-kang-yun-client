<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Service } from '../api/generated'
import type { PestInfoResponse } from '../api/generated'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()

const pestId = Number(route.params.id)
const pestInfo = ref<PestInfoResponse | null>(null)
const loading = ref(true)

// 获取病虫害详情
const fetchPestDetail = async () => {
  loading.value = true
  try {
    const res = await Service.readPestApiV1KnowledgePestsPestIdGet(pestId)
    pestInfo.value = res
  } catch (error) {
    console.error('获取详情失败', error)
    showToast('获取详情信息失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (pestId) {
    fetchPestDetail()
  } else {
    showToast('缺少参数')
    onClickLeft()
  }
})

// 返回规则：返回百科列表
const onClickLeft = () => {
  // 如果你的百科页面是 /encyclopedia，就跳回百科；否则也可以使用 router.back()
  router.push('/encyclopedia')
}

// 应用方案：跳转至治理记录填报
const applyScheme = () => {
  if (!pestInfo.value) return
  // 假设我们将当前病害的 ID 作为 schemeId 传给填报页（如果后端有独立的方案 ID 则替换为方案 ID）
  router.push({
    path: '/record/form',
    query: { schemeId: pestInfo.value.id }
  })
}

// 格式化分类标签
const formatCategory = (cat?: string) => cat || '未知分类'
</script>

<template>
  <div class="pest-detail-container">
    <van-nav-bar 
      title="病虫害详情" 
      left-text="返回" 
      left-arrow 
      fixed 
      placeholder 
      @click-left="onClickLeft" 
    />

    <van-skeleton title :row="10" :loading="loading" class="skeleton-wrap">
      <div v-if="pestInfo" class="content-wrapper">
        <van-image
          width="100%"
          height="220"
          fit="cover"
          :src="pestInfo.typical_image || 'https://fastly.jsdelivr.net/npm/@vant/assets/tree.jpeg'"
        />

        <div class="info-card section">
          <div class="header">
            <h1 class="title">{{ pestInfo.name }}</h1>
            <van-tag type="danger" size="large" plain>{{ formatCategory(pestInfo.category) }}</van-tag>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <van-icon name="warning-o" color="#ee0a24" /> 危害症状
          </div>
          <div class="section-content">
            <p>{{ pestInfo.symptom_description || '暂无症状描述' }}</p>
          </div>
        </div>

        <div class="section scheme-section">
          <div class="section-title">
            <van-icon name="shield-o" color="#07c160" /> 推荐防治方案
          </div>
          <div class="section-content scheme-content">
            <p>{{ (pestInfo as any).prevention_plan || '针对该病虫害，建议进行物理清除或使用专用药剂进行喷洒防治，并持续监测果园环境情况。' }}</p>
          </div>
        </div>
      </div>
    </van-skeleton>

    <van-action-bar v-if="!loading && pestInfo" class="custom-action-bar">
      <van-action-bar-icon icon="chat-o" text="求助专家" @click="router.push('/community')" />
      <van-action-bar-icon icon="star-o" text="收藏" @click="showToast('收藏成功')" />
      <van-action-bar-button 
        type="primary" 
        text="应用此方案去治理" 
        color="linear-gradient(to right, #4bb0ff, #07c160)"
        @click="applyScheme" 
      />
    </van-action-bar>
  </div>
</template>

<style scoped>
.pest-detail-container {
  background-color: #f7f8fa;
  /* 留出底部 ActionBar 的空间，防止内容被遮挡 */
  padding-bottom: 60px;
  min-height: 100vh;
}

.skeleton-wrap {
  margin-top: 20px;
}

.content-wrapper {
  background-color: #f7f8fa;
}

/* 统一区块样式 */
.section {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 10px;
}

.info-card {
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: bold;
  color: #323233;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #646566;
  white-space: pre-wrap; /* 保留后端换行符 */
}

/* 方案区域特殊样式 */
.scheme-section {
  margin-bottom: 0; /* 最后一个区块，贴底 */
}

.scheme-content {
  background-color: #f0f9eb;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e1f3d8;
}

.scheme-content p {
  color: #07c160;
  font-weight: 500;
}

/* 提升底部按钮层级 */
.custom-action-bar {
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
</style>
