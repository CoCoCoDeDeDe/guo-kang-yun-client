<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import { Service } from '../api/generated'
import type { GovernanceRecordCreate, GovernanceRecordUpdate } from '../api/generated'

// 获取真实后端地址，用于图片回显拼接
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const route = useRoute()
const router = useRouter()

// 页面状态
const isEdit = ref(false)
const recordId = ref<number | null>(null)
const loading = ref(false)
const fetching = ref(false)

// 时间选择器状态
const showPicker = ref(false)
// DatePicker 需要的数组格式
const currentDate = new Date()
const currentDatePickerValue = ref([
  String(currentDate.getFullYear()),
  String(currentDate.getMonth() + 1).padStart(2, '0'),
  String(currentDate.getDate()).padStart(2, '0')
])

// 表单数据
const formData = ref({
  pest_type: '',
  found_time: currentDatePickerValue.value.join('-'),
  location: '',
  description: '',
  status: 'in_progress' 
})

// 图片上传列表
const fileList = ref<any[]>([])

onMounted(async () => {
  const queryId = route.query.id as string
  if (queryId) {
    isEdit.value = true
    recordId.value = Number(queryId)
    fetching.value = true
    
    // 获取详情并回显数据
    try {
      const record = await Service.readGovernanceRecordApiV1GovernanceRecordIdGet(recordId.value)
      if (record) {
        formData.value.pest_type = record.pest_type
        formData.value.location = record.location || ''
        formData.value.description = record.description || ''
        formData.value.status = record.status as string
        
        // 回显时间
        if (record.found_time) {
          const date = new Date(record.found_time)
          currentDatePickerValue.value = [
            String(date.getFullYear()),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0')
          ]
          formData.value.found_time = currentDatePickerValue.value.join('-')
        }

        // 回显照片列表
        if (record.photos && record.photos.length > 0) {
          fileList.value = record.photos.map(photo => {
            // 拼接绝对路径用于 Vant 预览
            const fullUrl = photo.startsWith('http') 
              ? photo 
              : `${API_BASE.replace(/\/$/, '')}${photo.startsWith('/') ? photo : '/' + photo}`
            
            return {
              url: fullUrl,
              isImage: true,
              backendPath: photo // 暂存原始路径，方便提交时使用
            }
          })
        }
      }
    } catch (e) {
      console.error('获取记录详情失败', e)
      showToast('获取数据失败')
    } finally {
      fetching.value = false
    }
    return
  }

  // 处理知识库带过来的逻辑
  const schemeId = route.query.schemeId as string
  if (schemeId) {
    fetching.value = true
    try {
      const pest = await Service.readPestApiV1KnowledgePestsPestIdGet(Number(schemeId))
      if (pest) {
        formData.value.pest_type = pest.name 
      }
    } catch (e) {
      console.error('获取病虫害信息失败', e)
    } finally {
      fetching.value = false
    }
  }
})

const onConfirmDate = ({ selectedValues }: { selectedValues: string[] }) => {
  formData.value.found_time = selectedValues.join('-')
  showPicker.value = false
}

const onClickLeft = () => {
  router.back()
}

// 处理图片上传
const afterRead = async (fileItem: any | any[]) => {
  const items = Array.isArray(fileItem) ? fileItem : [fileItem]

  for (const item of items) {
    item.status = 'uploading'
    item.message = '上传中...'

    try {
      const res = await Service.uploadSingleImageApiV1UploadImagePost({
        file: item.file as any
      })
      
      item.status = 'done'
      item.message = '上传成功'
      item.url = res.image_url // 供 Vant 使用
      item.backendPath = res.image_url // 暂存后端返回的相对路径
    } catch (error) {
      console.error('图片上传失败:', error)
      item.status = 'failed'
      item.message = '上传失败'
    }
  }
}

// 提交表单
const onSubmit = async () => {
  if (fileList.value.some(item => item.status === 'uploading')) {
    showToast('请等待图片上传完成')
    return
  }
  
  if (fileList.value.some(item => item.status === 'failed')) {
    showToast('有图片上传失败，请移除或重试')
    return
  }

  loading.value = true
  try {
    // 过滤提取最终提交的图片列表
    const photos = fileList.value
      .filter(item => item.backendPath || item.url)
      .map(item => item.backendPath || item.url)

    let finalTime = formData.value.found_time;

    if (isEdit.value && recordId.value) {
      // 修复：直接传递 photos（哪怕是空数组 [] 也要传过去，让后端清空图片）
      // 同理，location 和 description 如果被清空，传递空字符串 '' 而不是 undefined
      const updateData: GovernanceRecordUpdate = {
        pest_type: formData.value.pest_type,
        found_time: finalTime,
        location: formData.value.location || '',
        description: formData.value.description || '',
        status: formData.value.status as any,
        photos: photos
      }
      await Service.updateGovernanceRecordApiV1GovernanceRecordIdPut(recordId.value, updateData)
      showSuccessToast('更新成功')
      router.back()
    } else {
      const createData: GovernanceRecordCreate = {
        pest_type: formData.value.pest_type,
        found_time: finalTime,
        location: formData.value.location || '',
        description: formData.value.description || '',
        status: formData.value.status as any,
        photos: photos
      }

      await Service.createGovernanceRecordApiV1GovernancePost(createData)
      showSuccessToast('提交成功')
      router.replace('/record/list')
    }
  } catch (error: any) {
    if (error.body && error.body.detail) {
      console.error('🔴 详细校验错误:', JSON.stringify(error.body.detail, null, 2))
      showFailToast(`参数格式错误，请查看控制台`)
    } else {
      console.error('保存失败', error)
      showFailToast('保存失败，请检查网络或表单内容')
    }
  } finally {
    loading.value = false
  }
}

const onOversize = () => {
  showToast('图片大小不能超过 5MB')
}
</script>

<template>
  <div class="record-form-container">
    <van-nav-bar :title="isEdit ? '编辑治理记录' : '新增治理记录'" left-text="取消" left-arrow fixed placeholder border
      safe-area-inset-top @click-left="onClickLeft" />

    <van-skeleton title :row="5" :loading="fetching" class="skeleton-wrap">
      <van-form @submit="onSubmit" class="form-body">
        <van-cell-group inset class="form-group">
          <van-field v-model="formData.pest_type" name="pest_type" label="病害类型" placeholder="请输入病虫害类型/名称" clearable
            :rules="[{ required: true, message: '病害类型不能为空' }]" />

          <van-field v-model="formData.found_time" is-link readonly name="found_time" label="发现时间" placeholder="点击选择时间"
            @click="showPicker = true" :rules="[{ required: true, message: '请选择发现时间' }]" />

          <van-field v-model="formData.location" name="location" label="果园位置" placeholder="如: A区3栋 / 苹果园北侧" clearable />

          <van-field v-model="formData.description" name="description" label="治理描述" type="textarea" rows="2" autosize
            placeholder="请描述症状或用药情况" />

          <van-field name="status" label="治理进度">
            <template #input>
              <van-radio-group v-model="formData.status" direction="horizontal">
                <van-radio name="in_progress" checked-color="#1989fa">治理中</van-radio>
                <van-radio name="completed" checked-color="#07c160">已解决</van-radio>
                <van-radio name="cancelled" checked-color="#ff976a">已取消</van-radio>
              </van-radio-group>
            </template>
          </van-field>
        </van-cell-group>

        <van-cell-group inset class="form-group">
          <van-field name="photos" label="现场照片" label-align="top">
            <template #input>
              <van-uploader 
                v-model="fileList" 
                multiple 
                :after-read="afterRead"
                :max-count="4" 
                :max-size="5 * 1024 * 1024"
                @oversize="onOversize" 
                upload-text="添加照片" 
              />
            </template>
          </van-field>
        </van-cell-group>

        <div class="submit-wrapper">
          <van-button round block type="primary" native-type="submit" :loading="loading"
            color="linear-gradient(to right, #4bb0ff, #07c160)">
            {{ isEdit ? '保存修改' : '提交记录' }}
          </van-button>
        </div>
      </van-form>
    </van-skeleton>

    <van-popup v-model:show="showPicker" position="bottom">
      <van-date-picker v-model="currentDatePickerValue" title="选择发现时间" @confirm="onConfirmDate"
        @cancel="showPicker = false" />
    </van-popup>
  </div>
</template>

<style scoped>
.record-form-container {
  background-color: #f7f8fa;
  min-height: 100vh;
}
.skeleton-wrap {
  margin-top: 20px;
}
.form-body {
  padding-top: 16px;
  padding-bottom: 40px;
}
.form-group {
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}
.submit-wrapper {
  margin: 30px 16px 16px 16px;
}
</style>