<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import { Service } from '../api/generated'
import type { PostCreate } from '../api/generated'

const router = useRouter()

const loading = ref(false)

// 分类选择器状态
const showPicker = ref(false)
const columns = [
  { text: '提问求助', value: '提问求助' },
  { text: '经验分享', value: '经验分享' },
  { text: '病害交流', value: '病害交流' },
  { text: '日常记录', value: '日常记录' }
]

// 帖子表单数据，补充了 category
const formData = ref({
  title: '',
  content: '',
  category: ''
})

// 确认选择分类
const onConfirmCategory = ({ selectedOptions }: { selectedOptions: any[] }) => {
  formData.value.category = selectedOptions[0].value
  showPicker.value = false
}

// 返回上一页 (取消)
const onClickLeft = () => {
  router.back()
}

// 提交表单
const onSubmit = async () => {
  loading.value = true
  try {
    // 组装符合 PostCreate 类型的数据，包含 category
    const payload: PostCreate = {
      title: formData.value.title,
      content: formData.value.content,
      category: formData.value.category
    }

    console.log('即将发送的帖子数据:', payload)

    // 调用 API 发帖
    await Service.createPostApiV1CommunityPostsPost(payload)
    
    showSuccessToast('发布成功')
    
    // 发帖成功后，返回社区页并替换历史记录
    router.replace('/community') 

  } catch (error: any) {
    // 精准拦截 FastAPI 的 422 校验错误
    if (error.body && error.body.detail) {
      console.error('🔴 详细校验错误:', JSON.stringify(error.body.detail, null, 2))
      showFailToast('内容格式不符合要求，请查看控制台')
    } else {
      console.error('发布失败', error)
      showFailToast('发布失败，请检查网络连接')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="post-create-container">
    <van-nav-bar 
      title="发布交流帖" 
      left-text="取消" 
      left-arrow 
      fixed 
      placeholder 
      @click-left="onClickLeft" 
    />

    <van-form @submit="onSubmit" class="form-wrap">
      <van-cell-group inset class="input-group">
        
        <van-field
          v-model="formData.category"
          is-link
          readonly
          name="category"
          label="帖子分类"
          placeholder="点击选择发帖分类"
          @click="showPicker = true"
          :rules="[{ required: true, message: '请选择帖子分类' }]"
        />

        <van-field
          v-model="formData.title"
          name="title"
          placeholder="起个吸引人的标题吧"
          :rules="[{ required: true, message: '请输入帖子标题' }]"
          maxlength="50"
          class="title-input"
        />

        <van-field
          v-model="formData.content"
          name="content"
          type="textarea"
          autosize
          :min-rows="8"
          maxlength="1000"
          show-word-limit
          placeholder="分享你的经验、求助病害问题，或者记录果园的日常..."
          :rules="[{ required: true, message: '请输入正文内容' }]"
          class="content-input"
        />

      </van-cell-group>

      <div class="submit-btn-wrap">
        <van-button 
          round 
          block 
          type="primary" 
          native-type="submit" 
          :loading="loading"
          color="#07c160"
        >
          发布帖子
        </van-button>
      </div>
    </van-form>

    <van-popup v-model:show="showPicker" position="bottom">
      <van-picker
        :columns="columns"
        title="选择帖子分类"
        @confirm="onConfirmCategory"
        @cancel="showPicker = false"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.post-create-container {
  background-color: #f7f8fa;
  min-height: 100vh;
}

.form-wrap {
  padding-top: 16px;
}

.input-group {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

/* 标题样式增强 */
.title-input {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
}

/* 穿透修改 placeholder 样式 */
.title-input :deep(.van-field__control::placeholder) {
  font-weight: normal;
  font-size: 16px;
  color: #c8c9cc;
}

/* 正文样式 */
.content-input {
  font-size: 15px;
  line-height: 1.6;
  padding-top: 16px; 
}

/* 按钮外层边距 */
.submit-btn-wrap {
  margin: 32px 16px 16px 16px;
}
</style>