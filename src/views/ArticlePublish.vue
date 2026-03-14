<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { Service } from '../api/generated'
import type { ArticleCreate } from '../api/generated'

const router = useRouter()

const loading = ref(false)

// 表单数据
const formData = ref({
  title: '',
  content: '',
  category: ''
})

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 提交文章
const onSubmit = async () => {
  loading.value = true
  try {
    // 组装 ArticleCreate 数据
    // 如果控制台报错 422 提示缺少某个字段（如 category），请在此处补充
    const payload: ArticleCreate = {
      title: formData.value.title,
      content: formData.value.content,
      category: formData.value.category
    }
    console.log('即将发送的科普文章数据:', payload)

    await Service.createArticleApiV1CommunityArticlesPost(payload)

    // 根据后端机制，这里可能是直接发布(PUBLISHED)或进入待审(PENDING)
    showSuccessToast('文章提交成功')

    // 成功后返回社区，并替换历史防止回退重复提交
    router.replace('/community')

  } catch (error: any) {
    // 【排错防线】：精准拦截 FastAPI 的 422 校验错误
    if (error.body && error.body.detail) {
      console.error('🔴 详细校验错误:', JSON.stringify(error.body.detail, null, 2))
      showFailToast('格式校验失败，请查看控制台')
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
  <div class="article-publish-container">
    <van-nav-bar title="发布科普文章" left-text="取消" left-arrow fixed placeholder @click-left="onClickLeft" />

    <van-form @submit="onSubmit" class="form-wrap">

      <div class="expert-banner">
        <van-icon name="certificate" size="18" />
        <span>您正在以【农业专家】身份发布专业文章</span>
      </div>

      <van-cell-group inset class="input-group">

        <van-field v-model="formData.title" name="title" placeholder="请输入专业的科普标题"
          :rules="[{ required: true, message: '文章标题不能为空' }]" maxlength="60" class="title-input" />

        <van-field v-model="formData.content" name="content" type="textarea" autosize :min-rows="12" maxlength="5000"
          show-word-limit placeholder="在此撰写专业农技文章、病害防治方案或科普知识。&#10;支持分段，尽量保持语言严谨易懂..."
          :rules="[{ required: true, message: '正文内容不能为空' }]" class="content-input" />

        <van-field v-model="formData.category" name="category" label="文章分类" placeholder="请输入文章分类 (如: 科普、防治...)"
          :rules="[{ required: true, message: '文章分类不能为空' }]" />

      </van-cell-group>

      <div class="submit-btn-wrap">
        <van-button round block type="primary" native-type="submit" :loading="loading" color="#1989fa">
          提交发布
        </van-button>
        <div class="publish-tips">
          提交后可能需要经过系统管理员审核才会对外展示
        </div>
      </div>
    </van-form>
  </div>
</template>

<style scoped>
.article-publish-container {
  background-color: #f7f8fa;
  min-height: 100vh;
}

.form-wrap {
  padding-top: 10px;
}

/* 身份提示横幅 */
.expert-banner {
  margin: 0 16px 12px 16px;
  padding: 10px 12px;
  background-color: #e6f4ff;
  color: #1677ff;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

/* 标题样式：明显放大加粗 */
.title-input {
  font-size: 20px;
  font-weight: bold;
  color: #323233;
}

.title-input :deep(.van-field__control::placeholder) {
  font-weight: normal;
  font-size: 18px;
  color: #c8c9cc;
}

/* 正文样式 */
.content-input {
  font-size: 16px;
  line-height: 1.8;
  padding-top: 16px;
}

/* 提交按钮区域 */
.submit-btn-wrap {
  margin: 32px 16px 16px 16px;
}

.publish-tips {
  margin-top: 12px;
  text-align: center;
  font-size: 12px;
  color: #969799;
}
</style>