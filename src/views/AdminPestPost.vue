<template>
  <div class="pest-post-page">
    <van-nav-bar title="新增病虫害" left-text="返回" left-arrow fixed placeholder safe-area-inset-top @click-left="onClickLeft" />

    <van-form @submit="onSubmit">
      <van-cell-group inset class="form-group">

        <van-field v-model="formData.name" name="name" label="名称" placeholder="请输入病虫害名称"
          :rules="[{ required: true, message: '请填写病虫害名称' }]" />

        <van-field v-model="formData.category" is-link readonly name="category" label="分类" placeholder="请选择分类"
          @click="showCategoryPicker = true" :rules="[{ required: true, message: '请选择病虫害分类' }]" />
        <van-popup v-model:show="showCategoryPicker" position="bottom">
          <van-picker title="选择分类" :columns="categoryColumns" @confirm="onConfirmCategory"
            @cancel="showCategoryPicker = false" />
        </van-popup>

        <van-field v-model="formData.affected_part" name="affected_part" label="受害部位" placeholder="请输入受害部位 (选填)" />

        <van-field v-model="formData.peak_season" name="peak_season" label="高发期" placeholder="请输入高发季节或时期 (选填)" />

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

        <van-field v-model="formData.symptom_description" name="symptom_description" label="症状描述" type="textarea"
          rows="3" autosize placeholder="请输入详细的症状描述 (选填)" />

      </van-cell-group>

      <div class="submit-btn-wrapper">
        <van-button round block type="primary" native-type="submit" :loading="isSubmitting" loading-text="提交中...">
          确认发布
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { Service } from '../api/generated';
import type { PestInfoCreate } from '../api/generated';
import type { PestCategoryEnum } from '../api/generated';

const router = useRouter();

// 按钮加载状态
const isSubmitting = ref(false);

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

// 导航栏返回
const onClickLeft = () => {
  router.push('/admin/pest/list');
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

// 提交表单处理
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
      finalImageUrl = fileList.value[0].backendPath || fileList.value[0].url;
    }

    const submitData: PestInfoCreate = {
      name: formData.value.name,
      category: formData.value.category,
      affected_part: formData.value.affected_part || null,
      symptom_description: formData.value.symptom_description || null,
      peak_season: formData.value.peak_season || null,
      typical_image: finalImageUrl || null,
    };

    await Service.createPestInfoApiV1KnowledgePestsPost(submitData);
    showToast({ type: 'success', message: '发布成功' });

    // 延迟一点点返回，让用户看到 Toast
    setTimeout(() => {
      router.push('/admin/pest/list');
    }, 1000);

  } catch (error: any) {
    console.error('发布失败:', error);
    if (error.status === 422) {
      showToast('参数校验失败，请检查输入格式');
    } else {
      showToast('发布失败，请稍后重试');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* 保持原有样式不变 */
.pest-post-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}

.form-group {
  margin-top: 16px;
}

.submit-btn-wrapper {
  margin: 24px 16px;
}
</style>