<template>
  <div class="login-container">
    <!-- 顶部导航 -->
    <div class="top-header">
      <div class="header-content">
        <div class="logo">
          <img src="@/assets/logo.jpeg" alt="博物馆Logo" class="logo-img" />
          <span class="logo-text">博物馆预约系统</span>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 左侧展示区 -->
      <div class="left-section">
        <div class="hero-image">
          <img src="@/assets/museum-hero.png" alt="博物馆展览" />
        </div>
        <div class="hero-overlay">
          <h1 class="hero-title">探索文明 传承历史</h1>
          <p class="hero-subtitle">让每一次参观都成为一次难忘的文化之旅</p>
        </div>
      </div>

      <!-- 右侧登录区 -->
      <div class="login-section">
        <div class="login-box">
          <h2 class="login-title">账号登录</h2>
          
          <el-form 
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
          >
            <!-- 用户名输入框 -->
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                :prefix-icon="User"
              />
            </el-form-item>

            <!-- 密码输入框 -->
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <!-- 验证码输入框 -->
            <el-form-item prop="captcha">
              <div class="captcha-container">
                <el-input
                  v-model="loginForm.captcha"
                  placeholder="请输入验证码"
                  :prefix-icon="Key"
                />
                <div class="captcha-img" @click="refreshCaptcha">
                  <div class="captcha-text">{{ captchaCode }}</div>
                </div>
              </div>
            </el-form-item>

            <!-- 记住密码 -->
            <div class="remember-forgot">
              <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
              <el-button type="text" @click="handleForgotPassword">忘记密码？</el-button>
            </div>

            <!-- 登录按钮 -->
            <el-button
              type="primary"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
            >
              登 录
            </el-button>

            <!-- 注册链接 -->
            <div class="register-link">
              <span>还没有账号？</span>
              <el-button type="text" @click="handleRegister">立即注册</el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="footer">
      <p class="copyright">Copyright © {{ new Date().getFullYear() }} 博物馆预约系统 All Rights Reserved</p>
      <p class="contact">技术支持：xxx团队 | 联系电话：xxx-xxxx-xxxx</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { User, Lock, Key } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 当前语言
const currentLang = ref('zh')

// 加载状态
const loading = ref(false)

// 验证码相关
const captchaCode = ref('')
const captchaInput = ref('')
const captchaCanvas = ref(null)

// 登录表单
const loginFormRef = ref(null)
const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  remember: false
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value === captchaCode.value) {
          callback()
        } else {
          callback(new Error('验证码错误'))
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 切换语言
const switchLang = (lang) => {
  currentLang.value = lang
  // TODO: 实现语言切换逻辑
}

// 生成随机验证码
const generateCaptcha = () => {
  captchaCode.value = Math.floor(1000 + Math.random() * 9000).toString()
  return captchaCode.value
}

// 刷新验证码
const refreshCaptcha = () => {
  generateCaptcha()
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    // 前端验证码验证
    if (loginForm.captcha !== captchaCode.value) {
      ElMessage.error('验证码错误')
      refreshCaptcha()
      loading.value = false
      return
    }
    
    // 调用登录接口
    const res = await userStore.loginAction({
      username: loginForm.username,
      password: loginForm.password
    })
    
    // 处理登录响应
    if (res && res.code === 200) {
      ElMessage.success('登录成功')
      // 获取重定向地址
      const redirect = route.query.redirect || '/'
      router.replace(redirect)
    } else {
      ElMessage.error(res.msg || '登录失败，请检查用户名和密码')
      refreshCaptcha()
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || '登录失败，请重试')
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

// 处理忘记密码
const handleForgotPassword = () => {
  // TODO: 实现忘记密码逻辑
  router.push('/forgot-password')
}

// 处理注册
const handleRegister = () => {
  router.push('/register')
}

// 组件挂载时刷新验证码
onMounted(() => {
  // 如果已登录，直接跳转到首页
  if (userStore.isLogin) {
    router.replace('/')
    return
  }
  generateCaptcha()
})
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F5F5F5;
}

.top-header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .logo-img {
        height: 32px;
      }
      
      .logo-text {
        font-size: 18px;
        font-weight: 600;
        color: #1E4C88;
      }
    }
    
    .language-switch {
      display: flex;
      gap: 12px;
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  max-width: 1200px;
  margin: 40px auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.left-section {
  flex: 1;
  position: relative;
  
  .hero-image {
    height: 100%;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to right, rgba(30, 76, 136, 0.8), transparent);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 60px;
    
    .hero-title {
      font-size: 36px;
      font-weight: bold;
      color: #fff;
      margin-bottom: 20px;
      font-family: "SimSun", serif;
    }
    
    .hero-subtitle {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

.login-section {
  width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  
  .login-box {
    .login-title {
      font-size: 24px;
      font-weight: 600;
      color: #1E4C88;
      text-align: center;
      margin-bottom: 30px;
    }
    
    .login-form {
      .captcha-container {
        display: flex;
        gap: 12px;
        
        .el-input {
          flex: 1;
        }
        
        .captcha-img {
          width: 120px;
          height: 40px;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          background-color: #e8f0fe;
          display: flex;
          justify-content: center;
          align-items: center;
          
          .captcha-text {
            font-family: 'Courier New', monospace;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 6px;
            color: #1E4C88;
            user-select: none;
          }
        }
      }
      
      .remember-forgot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 16px 0;
      }
      
      .login-button {
        width: 100%;
        height: 40px;
        font-size: 16px;
        background-color: #1E4C88;
        border-color: #1E4C88;
        
        &:hover {
          background-color: #153a6d;
          border-color: #153a6d;
        }
      }
      
      .register-link {
        text-align: center;
        margin-top: 16px;
        
        span {
          color: #606266;
        }
      }
    }
  }
}

.footer {
  background-color: #fff;
  padding: 20px 0;
  text-align: center;
  
  .copyright {
    font-size: 14px;
    color: #606266;
    margin-bottom: 8px;
  }
  
  .contact {
    font-size: 14px;
    color: #909399;
  }
}

// 输入框样式
:deep(.el-input__wrapper) {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: none !important;
  height: 40px;
  
  &.is-focus {
    border-color: #1E4C88 !important;
  }
  
  .el-input__inner {
    height: 40px;
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .main-content {
    margin: 20px;
    flex-direction: column;
  }
  
  .left-section {
    height: 300px;
  }
  
  .login-section {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .top-header .header-content {
    padding: 12px 16px;
    
    .logo-text {
      font-size: 16px;
    }
  }
  
  .main-content {
    margin: 10px;
  }
  
  .left-section {
    height: 200px;
    
    .hero-overlay {
      padding: 0 20px;
      
      .hero-title {
        font-size: 24px;
      }
      
      .hero-subtitle {
        font-size: 16px;
      }
    }
  }
  
  .login-section {
    padding: 20px;
  }
}
</style> 