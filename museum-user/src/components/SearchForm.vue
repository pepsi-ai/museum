<template>
  <div class="search-form">
    <el-form :model="formModel" :inline="true" @keyup.enter="handleSearch">
      <slot :model="formModel"></slot>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          <span>搜索</span>
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          <span>重置</span>
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  // 表单数据模型
  model: {
    type: Object,
    default: () => ({})
  },
  // 默认值
  defaultValues: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['search', 'reset'])

// 表单数据
const formModel = reactive(Object.assign({}, props.defaultValues, props.model))

// 监听父组件数据变化
watch(() => props.model, (val) => {
  Object.assign(formModel, val)
}, { deep: true })

// 搜索
const handleSearch = () => {
  emit('search', { ...formModel })
}

// 重置
const handleReset = () => {
  Object.keys(formModel).forEach(key => {
    formModel[key] = props.defaultValues[key] !== undefined ? props.defaultValues[key] : undefined
  })
  emit('reset', { ...formModel })
}
</script>

<style lang="scss" scoped>
.search-form {
  margin-bottom: 20px;
  
  .el-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    
    .el-form-item {
      margin-right: 10px;
      margin-bottom: 10px;
      
      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style> 