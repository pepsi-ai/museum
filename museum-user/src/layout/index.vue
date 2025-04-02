<template>
  <div class="app-container">
    <!-- 头部导航 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <img :src="logo" alt="博物馆Logo" class="logo-img" />
          <span class="logo-text">博物馆预约系统</span>
        </div>
        
        <div class="header-menu">
          <el-menu
            :default-active="activeMenu"
            mode="horizontal"
            router
            background-color="transparent"
            text-color="#333"
            active-text-color="#1E4C88"
          >
            <el-menu-item index="/home">首页</el-menu-item>
            <el-menu-item index="/exhibition">展览预约</el-menu-item>
            <el-menu-item index="/collection">馆藏珍品</el-menu-item>
          </el-menu>
        </div>
        
        <div class="search-box">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索展览/藏品" 
            class="search-input"
            :prefix-icon="Search"
          >
          </el-input>
        </div>
        
        <div class="user-actions">
          <el-dropdown @command="handleCommand" trigger="hover">
            <el-avatar :size="36" :src="userStore.isLogin ? (userInfo.avatar || defaultAvatar) : defaultUserIcon" class="user-avatar" />
            <template #dropdown>
              <el-dropdown-menu>
                <template v-if="userStore.isLogin">
                  <el-dropdown-item command="userCenter">个人中心</el-dropdown-item>
                  <el-dropdown-item command="myReservation">我的预约</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </template>
                <template v-else>
                  <el-dropdown-item command="login">登录</el-dropdown-item>
                  <el-dropdown-item command="register">注册</el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade-transform" mode="out-in">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </main>
    
    <!-- 页脚 -->
    <footer class="app-footer">
      <div class="footer-content">
        <p class="copyright">Copyright © {{ new Date().getFullYear() }} 博物馆预约系统 All Rights Reserved</p>
        <p class="contact">技术支持：xxx团队 | 联系电话：xxx-xxxx-xxxx</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'
import { ArrowDown, Search } from '@element-plus/icons-vue'

// 引入logo和默认用户图标
import logo from '@/assets/logo.jpeg'
import defaultUserIcon from '@/assets/user.png'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 搜索关键词
const searchKeyword = ref('')

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 用户信息
const userInfo = computed(() => userStore.userInfo || {})

// 当前活动菜单
const activeMenu = computed(() => {
  const { path } = route
  return path
})

// 搜索处理
const handleSearch = () => {
  if (!searchKeyword.value.trim()) return
  
  router.push({
    path: '/search',
    query: { keyword: searchKeyword.value }
  })
}

// 跳转到首页
const goHome = () => {
  router.push('/')
}

// 下拉菜单命令处理
const handleCommand = (command) => {
  if (command === 'userCenter') {
    router.push('/user')
  } else if (command === 'myReservation') {
    router.push('/user?tab=reservations')
  } else if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await userStore.logoutAction()
      router.push('/login')
    }).catch(() => {})
  } else if (command === 'login') {
    router.push('/login')
  } else if (command === 'register') {
    router.push('/register')
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    height: 64px;
    display: flex;
    align-items: center;
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      
      .logo-img {
        height: 32px;
      }
      
      .logo-text {
        font-size: 18px;
        font-weight: 600;
        color: #1E4C88;
      }
    }
    
    .header-menu {
      margin-left: 30px;
      flex: 1;
      
      :deep(.el-menu) {
        border-bottom: none;
        
        .el-menu-item {
          font-size: 16px;
          
          &.is-active {
            font-weight: 600;
            background-color: rgba(30, 76, 136, 0.05);
          }
        }
      }
    }
    
    .search-box {
      margin: 0 20px;
      width: 240px;
      
      .search-input {
        :deep(.el-input__wrapper) {
          border-radius: 20px;
          box-shadow: none;
          border: 1px solid #e0e0e0;
          background-color: #f5f7fa;
          
          &:hover, &:focus, &.is-focus {
            border-color: #1E4C88;
            box-shadow: 0 0 0 1px rgba(30, 76, 136, 0.1);
          }
        }
        
        :deep(.el-input__prefix) {
          color: #999;
        }
      }
    }
    
    .user-actions {
      margin-left: 15px;
      
      .user-avatar {
        cursor: pointer;
        transition: transform 0.2s;
        border: none !important;
        
        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
}

.app-main {
  flex: 1;
  padding: 24px 0;
  background-color: #f5f5f5;
}

.app-footer {
  background-color: #fff;
  border-top: 1px solid #eee;
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
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
}

/* 路由过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style> 