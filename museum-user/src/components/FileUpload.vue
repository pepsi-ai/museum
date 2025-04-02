<template>
  <div class="file-upload">
    <el-upload
      :action="uploadUrl"
      :headers="headers"
      :multiple="multiple"
      :limit="limit"
      :file-list="fileList"
      :list-type="listType"
      :accept="accept"
      :disabled="disabled"
      :drag="drag"
      :show-file-list="showFileList"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-exceed="handleExceed"
      :on-progress="handleProgress"
      :before-upload="beforeUpload"
      :on-change="handleChange"
    >
      <template v-if="listType === 'picture-card'">
        <el-icon>
          <Plus />
        </el-icon>
      </template>
      
      <template v-else-if="drag">
        <el-icon class="el-icon--upload">
          <Upload />
        </el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            {{ tipText }}
          </div>
        </template>
      </template>
      
      <template v-else>
        <el-button type="primary">
          <el-icon>
            <Upload />
          </el-icon>
          <span>点击上传</span>
        </el-button>
        <template #tip>
          <div class="el-upload__tip">
            {{ tipText }}
          </div>
        </template>
      </template>
    </el-upload>
    
    <!-- 图片预览弹窗 -->
    <el-dialog v-model="dialogVisible" title="预览">
      <img class="preview-image" :src="previewUrl" alt="预览图片" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import config from '@/config'

const props = defineProps({
  // 文件列表，格式：[{name, url}]
  modelValue: {
    type: Array,
    default: () => []
  },
  // 上传地址，默认使用环境变量中的上传地址
  action: {
    type: String,
    default: ''
  },
  // 是否支持多选
  multiple: {
    type: Boolean,
    default: false
  },
  // 最大上传数量
  limit: {
    type: Number,
    default: 5
  },
  // 上传类型
  listType: {
    type: String,
    default: 'text',
    validator: (val) => ['text', 'picture', 'picture-card'].includes(val)
  },
  // 接受上传的文件类型
  accept: {
    type: String,
    default: ''
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否启用拖拽上传
  drag: {
    type: Boolean,
    default: false
  },
  // 是否显示已上传文件列表
  showFileList: {
    type: Boolean,
    default: true
  },
  // 提示文字
  tipText: {
    type: String,
    default: '支持上传jpg、png、gif格式图片文件，且不超过5MB'
  }
})

const emit = defineEmits(['update:modelValue', 'success', 'error', 'remove', 'preview', 'exceed'])

// 用户store
const userStore = useUserStore()

// 上传URL
const uploadUrl = computed(() => props.action || import.meta.env.VITE_APP_UPLOAD_URL || '')

// 请求头信息
const headers = computed(() => {
  return {
    Authorization: `Bearer ${userStore.token}`
  }
})

// 文件列表
const fileList = ref([])

// 预览相关变量
const dialogVisible = ref(false)
const previewUrl = ref('')

// 监听props变化，更新文件列表
watch(() => props.modelValue, (val) => {
  if (val && val.length > 0) {
    fileList.value = val.map(item => {
      if (typeof item === 'string') {
        return { name: item.split('/').pop(), url: item }
      }
      return item
    })
  } else {
    fileList.value = []
  }
}, { deep: true, immediate: true })

// 上传前校验
const beforeUpload = (file) => {
  // 校验文件类型
  if (props.accept) {
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    const acceptArr = props.accept.split(',')
    if (!acceptArr.some(type => type.trim() === fileExt || type.trim() === `*${fileExt}`)) {
      ElMessage.error(`文件格式不正确，请上传${props.accept}格式的文件!`)
      return false
    }
  }
  
  // 校验文件大小
  const isLt = file.size / 1024 / 1024 < config.uploadSizeLimit
  if (!isLt) {
    ElMessage.error(`文件大小不能超过${config.uploadSizeLimit}MB!`)
    return false
  }
  
  return true
}

// 上传成功回调
const handleSuccess = (response, file, fileList) => {
  // 更新文件列表
  updateFileList(fileList)
  
  // 触发成功事件
  emit('success', { response, file, fileList })
}

// 上传失败回调
const handleError = (error, file, fileList) => {
  ElMessage.error('文件上传失败!')
  emit('error', { error, file, fileList })
}

// 文件列表移除文件回调
const handleRemove = (file, fileList) => {
  updateFileList(fileList)
  emit('remove', { file, fileList })
}

// 文件预览回调
const handlePreview = (file) => {
  if (['picture-card', 'picture'].includes(props.listType)) {
    previewUrl.value = file.url
    dialogVisible.value = true
  }
  emit('preview', file)
}

// 超出上传数量限制回调
const handleExceed = (files, fileList) => {
  ElMessage.warning(`当前限制选择${props.limit}个文件，本次选择了${files.length}个文件，共选择了${files.length + fileList.length}个文件`)
  emit('exceed', { files, fileList })
}

// 文件上传时的钩子
const handleProgress = (event, file, fileList) => {
  // 上传进度处理逻辑
}

// 文件状态改变时的钩子
const handleChange = (file, fileList) => {
  // 文件状态改变处理逻辑
}

// 更新文件列表
const updateFileList = (files) => {
  const result = files.map(item => {
    if (item.response) {
      return {
        name: item.name,
        url: item.response.data
      }
    } else {
      return {
        name: item.name,
        url: item.url
      }
    }
  })
  
  emit('update:modelValue', result)
}
</script>

<style lang="scss" scoped>
.file-upload {
  .preview-image {
    width: 100%;
    max-height: 400px;
    object-fit: contain;
  }
}
</style> 