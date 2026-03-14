<template>
  <div class="pest-list-page">
    <van-nav-bar
      title="病虫害知识库"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="onClickLeft"
    />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多知识了"
        @load="onLoad"
      >
        <van-swipe-cell v-for="item in pestList" :key="item.id">
          
          <van-card
            :title="item.name"
            :desc="item.symptom_description || '暂无描述'"
            :thumb="item.typical_image || defaultThumb"
            @click="onClickItem(item.id)"
          >
            <template #tags>
              <van-tag plain type="primary" style="margin-right: 4px;">
                {{ item.category }}
              </van-tag>
              <van-tag plain type="danger" v-if="item.peak_season">
                {{ item.peak_season }}
              </van-tag>
            </template>
            <template #bottom>
              <div v-if="item.affected_part" class="affected-part">
                受害部位: {{ item.affected_part }}
              </div>
            </template>
          </van-card>

          <template #right>
            <van-button 
              square 
              type="primary" 
              text="编辑" 
              class="swipe-action-btn"
              @click.stop="onEdit(item.id)"
            />
            <van-button 
              square 
              type="danger" 
              text="删除" 
              class="swipe-action-btn"
              @click.stop="onDelete(item.id)"
            />
          </template>
        </van-swipe-cell>
      </van-list>
    </van-pull-refresh>

    <div class="fab-container">
      <van-button round icon="plus" type="primary" shadow @click="onAdd" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { Service } from '../api/generated';
import type { PestInfoResponse } from '../api/generated';

const router = useRouter();

// 列表数据状态
const pestList = ref<PestInfoResponse[]>([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);

// 占位默认图 (当 typical_image 为空时显示)
const defaultThumb = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg';

// 返回上一页
const onClickLeft = () => {
  router.push('/profile');
};

// 获取列表数据
const onLoad = async () => {
  try {
    // 实际项目中可以根据 skip 和 limit 做分页处理，这里演示一次性拉取或累加
    const skip = pestList.value.length;
    // 若 refreshing 状态下，将 skip 重置为 0
    const currentSkip = refreshing.value ? 0 : skip;
    
    const res = await Service.readPestsApiV1KnowledgePestsGet(currentSkip, 20);
    
    if (refreshing.value) {
      pestList.value = [];
      refreshing.value = false;
    }

    if (res && res.length > 0) {
      pestList.value.push(...res);
    } else {
      // 如果没有数据返回，表示已经加载完毕
      finished.value = true;
    }

    // 判断后端是否还有更多数据 (假设每次请求20条，如果少于20条说明没数据了)
    if (res.length < 20) {
      finished.value = true;
    }
  } catch (error) {
    console.error('获取病虫害列表失败:', error);
    showToast('获取列表失败');
    finished.value = true; // 出错也结束加载，防止无限转圈
  } finally {
    loading.value = false;
  }
};

// 下拉刷新
const onRefresh = () => {
  finished.value = false;
  loading.value = true;
  onLoad();
};

// 浏览知识详情
const onClickItem = (id: number) => {
  router.push(`/pest/detail/${id}`);
};

// 编辑知识
const onEdit = (id: number) => {
  router.push(`/admin/pest/edit/${id}`);
};

// 添加知识 (附加功能，方便管理员添加)
const onAdd = () => {
  router.push('/admin/pest/post');
};

// 删除知识
const onDelete = (id: number) => {
  showConfirmDialog({
    title: '确认删除',
    message: '删除后无法恢复，是否确认删除该病虫害知识？',
  }).then(async () => {
    try {
      // 确认删除
      await Service.deletePestInfoApiV1KnowledgePestsPestIdDelete(id);
      showToast('删除成功');
      // 从本地列表中移除该项
      pestList.value = pestList.value.filter((item) => item.id !== id);
    } catch (error) {
      console.error('删除失败:', error);
      showToast('删除失败，请稍后重试');
    }
  }).catch(() => {
    // 取消删除
  });
};
</script>

<style scoped>
.pest-list-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}

/* 左滑出来的按钮让它撑满高度 */
.swipe-action-btn {
  height: 100%;
}

.affected-part {
  margin-top: 4px;
  font-size: 12px;
  color: #969799;
}

/* 悬浮添加按钮 (可选体验提升) */
.fab-container {
  position: fixed;
  right: 20px;
  bottom: 40px;
  z-index: 99;
}
.fab-container .van-button {
  width: 50px;
  height: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>