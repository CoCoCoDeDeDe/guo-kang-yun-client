<template>
  <div class="pest-edit-page">
    <van-nav-bar
      title="编辑病虫害"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="onClickLeft"
    />

    <van-skeleton title :row="8" :loading="isFetching" class="skeleton-wrapper">
      
      <van-form @submit="onSubmit">
        <van-cell-group inset class="form-group">
          
          <van-field
            v-model="formData.name"
            name="name"
            label="名称"
            placeholder="请输入病虫害名称"
            :rules="[{ required: true, message: '请填写病虫害名称' }]"
          />

          <van-field
            v-model="formData.category"
            is-link
            readonly
            name="category"
            label="分类"
            placeholder="请选择分类"
            @click="showCategoryPicker = true"
            :rules="[{ required: true, message: '请选择病虫害分类' }]"
          />
          <van-popup v-model:show="showCategoryPicker" position="bottom">
            <van-picker
              title="选择分类"
              :columns="categoryColumns"
              @confirm="onConfirmCategory"
              @cancel="showCategoryPicker = false"
            />
          </van-popup>

          <van-field
            v-model="formData.affected_part"
            name="affected_part"
            label="受害部位"
            placeholder="请输入受害部位 (选填)"
          />

          <van-field
            v-model="formData.peak_season"
            name="peak_season"
            label="高发期"
            placeholder="请输入高发季节或时期 (选填)"
          />

          <van-field name="typical_image" label="典型图片" label-align="top">
            <template #input>
              <van-uploader 
                v-model="fileList" 
                :max-count="1" 
                :max-size="5 * 1024 * 1024"
                :after-read="afterRead"
                @oversize="onOversize" 
                upload-text="上传图片" 
              />
            </template>
          </van-field>

          <van-field
            v-model="formData.symptom_description"
            name="symptom_description"
            label="症状描述"
            type="textarea"
            rows="3"
            autosize
            placeholder="请输入详细的症状描述 (选填)"
          />

        </van-cell-group>

        <div class="submit-btn-wrapper">
          <van-button 
            round 
            block 
            type="primary" 
            native-type="submit" 
            :loading="isSubmitting"
            loading-text="保存中..."
          >
            保存修改
          </van-button>
        </div>
      </van-form>
    </van-skeleton>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { Service } from '../api/generated';
import type { PestInfoUpdate } from '../api/generated';
import type { PestCategoryEnum } from '../api/generated';

// 获取真实后端地址，用于图片回显拼接
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const router = useRouter();
const route = useRoute();

// 从路由参数中获取要编辑的病虫害 ID
const pestId = Number(route.params.id);

// 状态控制
const isFetching = ref(true); // 是否正在获取详情
const isSubmitting = ref(false); // 是否正在提交修改

// 表单响应式数据
const formData = ref({
  name: '',
  category: '' as PestCategoryEnum, 
  affected_part: '',
  symptom_description: '',
  peak_season: '',
});

// 新增：图片上传列表
const fileList = ref<any[]>([]);

// 分类选择器相关逻辑
const showCategoryPicker = ref(false);
const categoryColumns = [
  { text: '病害', value: '病害' },
  { text: '虫害', value: '虫害' },
  { text: '草害', value: '草害' },
  { text: '其他', value: '其他' },
];

const onConfirmCategory = ({ selectedOptions }: any) => {
  if (selectedOptions && selectedOptions.length > 0) {
    formData.value.category = selectedOptions[0].value;
  }
  showCategoryPicker.value = false;
};

// 页面挂载时：获取当前病虫害信息并回填到表单中
onMounted(async () => {
  if (!pestId) {
    showToast('无效的病虫害 ID');
    onClickLeft();
    return;
  }

  try {
    const res = await Service.readPestApiV1KnowledgePestsPestIdGet(pestId);
    
    // 数据回填
    formData.value = {
      name: res.name,
      category: res.category,
      affected_part: res.affected_part || '',
      symptom_description: res.symptom_description || '',
      peak_season: res.peak_season || '',
    };

    // 新增：回显图片
    if (res.typical_image) {
      const photo = res.typical_image;
      // 拼接绝对路径用于 Vant 预览
      const fullUrl = photo.startsWith('http') 
        ? photo 
        : `${API_BASE.replace(/\/$/, '')}${photo.startsWith('/') ? photo : '/' + photo}`;
      
      fileList.value = [{
        url: fullUrl,
        isImage: true,
        backendPath: photo // 暂存原始路径，方便提交时使用
      }];
    }
  } catch (error) {
    console.error('获取详情失败:', error);
    showToast('获取数据失败，请检查网络');
  } finally {
    isFetching.value = false;
  }
});

// 导航栏返回
const onClickLeft = () => {
  router.push(`/pest/detail/${pestId}`);
};

// 新增：处理图片上传逻辑
const afterRead = async (fileItem: any | any[]) => {
  const items = Array.isArray(fileItem) ? fileItem : [fileItem];

  for (const item of items) {
    item.status = 'uploading';
    item.message = '上传中...';

    try {
      const res = await Service.uploadSingleImageApiV1UploadImagePost({
        file: item.file as any
      });
      
      item.status = 'done';
      item.message = '上传成功';
      item.url = res.image_url; // 供 Vant 预览使用
      item.backendPath = res.image_url; // 暂存后端返回的真实相对路径
    } catch (error) {
      console.error('图片上传失败:', error);
      item.status = 'failed';
      item.message = '上传失败';
    }
  }
};

const onOversize = () => {
  showToast('图片大小不能超过 5MB');
};

// 提交表单修改
const onSubmit = async () => {
  // 校验是否有图片正在上传中或失败
  if (fileList.value.some(item => item.status === 'uploading')) {
    showToast('请等待图片上传完成');
    return;
  }
  if (fileList.value.some(item => item.status === 'failed')) {
    showToast('有图片上传失败，请移除或重试');
    return;
  }

  isSubmitting.value = true;
  try {
    // 提取上传好的典型图片路径
    let finalImageUrl = '';
    if (fileList.value.length > 0) {
      // 优先使用暂存的相对路径 backendPath
      finalImageUrl = fileList.value[0].backendPath || fileList.value[0].url;
    }

    // 数据清洗：如果字段被清空，或者图片被删除，传 null 给后端
    const updatePayload: PestInfoUpdate = {
      name: formData.value.name,
      category: formData.value.category,
      affected_part: formData.value.affected_part || null,
      symptom_description: formData.value.symptom_description || null,
      peak_season: formData.value.peak_season || null,
      typical_image: finalImageUrl || null,
    };

    // 发起 Update 更新请求 (PUT)
    await Service.updatePestInfoApiV1KnowledgePestsPestIdPut(pestId, updatePayload);
    
    showToast({ type: 'success', message: '保存成功' });
    
    setTimeout(() => {
      router.push(`/pest/detail/${pestId}`);
    }, 1000);

  } catch (error: any) {
    console.error('保存修改失败:', error);
    if (error.status === 422) {
      showToast('参数校验失败，请检查输入格式');
    } else {
      showToast('保存失败，请稍后重试');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* 保持原有样式不变 */
.pest-edit-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}

.skeleton-wrapper {
  margin-top: 24px;
}

.form-group {
  margin-top: 16px;
}

.submit-btn-wrapper {
  margin: 24px 16px;
}
</style>