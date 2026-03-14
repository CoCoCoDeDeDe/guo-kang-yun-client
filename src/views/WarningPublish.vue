<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant'
import { Service } from '../api/generated'
import type { WarningMessageCreate } from '../api/generated'

const router = useRouter()

const loading = ref(false)

// 时间选择器状态
const showPicker = ref(false)
const currentDate = new Date()
// 默认过期时间设为 7 天后
currentDate.setDate(currentDate.getDate() + 7)
const currentDatePickerValue = ref([
  String(currentDate.getFullYear()),
  String(currentDate.getMonth() + 1).padStart(2, '0'),
  String(currentDate.getDate()).padStart(2, '0')
])

// 表单数据，严格对齐 WarningMessageCreate
const formData = ref({
  level: 'BLUE',
  affected_scope: '全局范围',
  prevention_measures: '', // 替换了原来的 content
  expire_time: currentDatePickerValue.value.join('-') // 新增的过期时间
})

// 时间选择确认
const onConfirmDate = ({ selectedValues }: { selectedValues: string[] }) => {
  formData.value.expire_time = selectedValues.join('-')
  showPicker.value = false
}

// 返回个人中心
const onClickLeft = () => {
  router.back()
}

// 提交表单（带有二次确认）
const onSubmit = () => {
  showConfirmDialog({
    title: '确认发布预警？',
    message: '发布后，系统将自动向受影响范围内的果农发送广播邮件，此操作不可撤回。',
    confirmButtonText: '确认发布',
    confirmButtonColor: '#ee0a24'
  })
    .then(() => {
      executePublish()
    })
    .catch(() => {
      // 取消发布
    })
}

// 执行 API 请求
const executePublish = async () => {
  loading.value = true
  try {
    // 格式化时间，如果后端严格要求 ISO 8601 的 datetime，我们在日期后补全时间到当天的 23:59:59
    let finalTime = formData.value.expire_time
    if (!finalTime.includes('T')) {
      finalTime = `${finalTime}T23:59:59`
    }

    // 严格按照 WarningMessageCreate 组装 payload
    const payload: WarningMessageCreate = {
      level: formData.value.level as any,
      affected_scope: formData.value.affected_scope,
      prevention_measures: formData.value.prevention_measures,
      expire_time: finalTime
    }

    console.log('即将发送的预警数据:', payload)

    await Service.publishWarningApiV1WarningPost(payload)

    showSuccessToast('预警已发布，广播邮件发送中')

    // 发布成功后，跳转到消息列表页查看刚刚发布的预警
    router.replace('/message/list')

  } catch (error: any) {
    if (error.body && error.body.detail) {
      console.error('🔴 详细校验错误:', JSON.stringify(error.body.detail, null, 2))
      showFailToast('参数格式错误，请查看控制台')
    } else {
      console.error('发布失败', error)
      showFailToast('发布失败，请检查网络')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="warning-publish-container">
    <van-nav-bar title="发布灾情预警" left-text="返回" left-arrow fixed placeholder border @click-left="onClickLeft" />

    <div class="admin-alert">
      <van-icon name="warning-o" size="20" />
      <div class="alert-text">
        <strong>高危操作提醒</strong>
        <p>您正在操作全站预警广播系统，请确保信息准确无误，以免造成果农恐慌。</p>
      </div>
    </div>

    <van-form @submit="onSubmit" class="form-wrapper">
      <van-cell-group inset class="form-group">

        <van-field name="level" label="预警等级" label-align="top">
          <template #input>
            <van-radio-group v-model="formData.level" direction="horizontal" class="level-radio-group">
              <van-radio name="普通">普通 (Blue)</van-radio>
              <van-radio name="紧急">紧急 (Red)</van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <van-field v-model="formData.affected_scope" name="affected_scope" label="影响范围" placeholder="例如：全局范围 / A区及B区"
          clearable :rules="[{ required: true, message: '请填写受影响的果园范围' }]" />

        <van-field v-model="formData.expire_time" is-link readonly name="expire_time" label="预警失效时间"
          placeholder="点击选择预警失效时间" @click="showPicker = true" :rules="[{ required: true, message: '请选择失效时间' }]" />

        <van-field v-model="formData.prevention_measures" name="prevention_measures" label="防范建议与措施" label-align="top"
          type="textarea" autosize :min-rows="6" maxlength="500" show-word-limit placeholder="请输入详细的病害/灾情预警信息及防范建议..."
          :rules="[{ required: true, message: '防范建议不能为空' }]" class="content-input" />

      </van-cell-group>

      <div class="submit-btn-wrap">
        <van-button round block type="danger" native-type="submit" :loading="loading" icon="send-gift-o">
          确认发布并广播
        </van-button>
      </div>
    </van-form>

    <van-popup v-model:show="showPicker" position="bottom">
      <van-date-picker v-model="currentDatePickerValue" title="选择失效时间" @confirm="onConfirmDate"
        @cancel="showPicker = false" />
    </van-popup>

  </div>
</template>

<style scoped>
.warning-publish-container {
  background-color: #f7f8fa;
  min-height: 100vh;
}

/* 顶部管理员警示横幅 */
.admin-alert {
  background-color: #fff1f0;
  border: 1px solid #ffccc7;
  color: #ee0a24;
  margin: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(238, 10, 36, 0.05);
}

.alert-text strong {
  font-size: 15px;
  display: block;
  margin-bottom: 4px;
}

.alert-text p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  opacity: 0.9;
}

.form-wrapper {
  padding-bottom: 40px;
}

.form-group {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.level-radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-input {
  font-size: 15px;
  line-height: 1.6;
}

.submit-btn-wrap {
  margin: 32px 16px 16px 16px;
}
</style>