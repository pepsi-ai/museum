<template>
  <div class="not-found">
    <div class="error-container">
      <div class="error-content">
        <div class="error-image">
          <el-icon class="icon-404"><WarningFilled /></el-icon>
        </div>
        <h1 class="error-title">404</h1>
        <h2 class="error-subtitle">页面不存在</h2>
        <p class="error-message">抱歉，您访问的页面不存在或已被移除</p>
        <el-button type="primary" @click="backHome">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { WarningFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const backHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.error-container {
  width: 100%;
  max-width: 500px;
  padding: 40px;
  text-align: center;
}

.error-content {
  background-color: #fff;
  padding: 60px 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.error-image {
  margin-bottom: 24px;
  
  .icon-404 {
    font-size: 80px;
    color: #1E4C88;
  }
}

.error-title {
  font-size: 72px;
  font-weight: bold;
  color: #1E4C88;
  margin: 0 0 8px;
  line-height: 1;
}

.error-subtitle {
  font-size: 24px;
  color: #333;
  margin: 0 0 20px;
}

.error-message {
  color: #666;
  margin-bottom: 30px;
}
</style> 