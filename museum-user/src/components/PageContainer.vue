<template>
  <div class="page-container">
    <!-- 页头 -->
    <div v-if="title || $slots.header" class="page-header">
      <div v-if="title" class="page-title">
        <el-icon v-if="icon"><component :is="icon" /></el-icon>
        <span>{{ title }}</span>
      </div>
      <div class="page-header-content">
        <slot name="header"></slot>
      </div>
    </div>
    
    <!-- 页面内容 -->
    <div class="page-content">
      <slot></slot>
    </div>
    
    <!-- 页脚 -->
    <div v-if="$slots.footer" class="page-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  // 页面标题
  title: {
    type: String,
    default: ''
  },
  // 图标名称
  icon: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    margin-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
    
    .page-title {
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;
      
      .el-icon {
        margin-right: 8px;
        font-size: 20px;
      }
    }
    
    .page-header-content {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  }
  
  .page-content {
    flex: 1;
    overflow: auto;
  }
  
  .page-footer {
    padding: 16px 0;
    margin-top: 16px;
    border-top: 1px solid #ebeef5;
  }
}
</style> 