<template>
  <div class="pest-post-page">
    <van-nav-bar title="新增病虫害" left-text="返回" left-arrow fixed placeholder @click-left="onClickLeft" />

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

        <van-field v-model="formData.typical_image" name="typical_image" label="典型图片" placeholder="请输入图片URL链接 (选填)" />

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
// 💡 修改点在这里：去掉 <PestInfoCreate> 泛型，让 TS 自动推断这些字段为纯 string 类型
// 这样 Vant 组件的 v-model 就不会因为 null 报错了
const formData = ref({
  name: '',
  category: '' as PestCategoryEnum,
  affected_part: '',
  symptom_description: '',
  peak_season: '',
  typical_image: '',
});

// 分类选择器相关逻辑
const showCategoryPicker = ref(false);

// 根据您的实际业务场景，这里填充 PestCategoryEnum 可能的值
// 如果后端 OpenAPI 确切枚举值为别的，请修改此处的 value 值
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

// 提交表单处理
const onSubmit = async () => {
  isSubmitting.value = true;
  try {
    // 过滤掉空字符串，将其转为 undefined 或 null（根据后端要求，通常传 null 或直接不传可选字段）
    // 这里为了避免传递无意义的空字符串给后端 null 字段
    const submitData: PestInfoCreate = {
      name: formData.value.name,
      category: formData.value.category,
      affected_part: formData.value.affected_part || null,
      symptom_description: formData.value.symptom_description || null,
      peak_season: formData.value.peak_season || null,
      typical_image: formData.value.typical_image || null,
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