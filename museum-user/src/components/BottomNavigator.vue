<template>
  <div class="bottom-navigator">
    <div class="nav-item" :class="{ active: activeTab === 'home' }" @click="navigateTo('home')">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </div>
    <div class="nav-item" :class="{ active: activeTab === 'appointment' }" @click="navigateTo('appointment')">
      <el-icon><Calendar /></el-icon>
      <span>预约</span>
    </div>
    <div class="nav-item" :class="{ active: activeTab === 'personal' }" @click="navigateTo('personal')">
      <el-icon><User /></el-icon>
      <span>我的</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { HomeFilled, Calendar, User } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const activeTab = ref('home');

// 根据当前路由设置激活的标签
onMounted(() => {
  const path = route.path;
  if (path.includes('/home')) {
    activeTab.value = 'home';
  } else if (path.includes('/appointment')) {
    activeTab.value = 'appointment';
  } else if (path.includes('/personal')) {
    activeTab.value = 'personal';
  }
});

// 导航到指定路由
const navigateTo = (tab) => {
  activeTab.value = tab;
  switch (tab) {
    case 'home':
      router.push('/home');
      break;
    case 'appointment':
      router.push('/appointment');
      break;
    case 'personal':
      router.push('/personal');
      break;
  }
};
</script>

<style scoped>
.bottom-navigator {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 20px;
  cursor: pointer;
  color: #909399;
  transition: all 0.3s;
}

.nav-item .el-icon {
  font-size: 24px;
  margin-bottom: 2px;
}

.nav-item span {
  font-size: 12px;
}

.nav-item.active {
  color: #1E4B8C;
}
</style> 
  <div class="bottom-navigator">
    <div class="nav-item" :class="{ active: activeTab === 'home' }" @click="navigateTo('home')">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </div>
    <div class="nav-item" :class="{ active: activeTab === 'appointment' }" @click="navigateTo('appointment')">
      <el-icon><Calendar /></el-icon>
      <span>预约</span>
    </div>
    <div class="nav-item" :class="{ active: activeTab === 'personal' }" @click="navigateTo('personal')">
      <el-icon><User /></el-icon>
      <span>我的</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { HomeFilled, Calendar, User } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const activeTab = ref('home');

// 根据当前路由设置激活的标签
onMounted(() => {
  const path = route.path;
  if (path.includes('/home')) {
    activeTab.value = 'home';
  } else if (path.includes('/appointment')) {
    activeTab.value = 'appointment';
  } else if (path.includes('/personal')) {
    activeTab.value = 'personal';
  }
});

// 导航到指定路由
const navigateTo = (tab) => {
  activeTab.value = tab;
  switch (tab) {
    case 'home':
      router.push('/home');
      break;
    case 'appointment':
      router.push('/appointment');
      break;
    case 'personal':
      router.push('/personal');
      break;
  }
};
</script>

<style scoped>
.bottom-navigator {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 20px;
  cursor: pointer;
  color: #909399;
  transition: all 0.3s;
}

.nav-item .el-icon {
  font-size: 24px;
  margin-bottom: 2px;
}

.nav-item span {
  font-size: 12px;
}

.nav-item.active {
  color: #1E4B8C;
}
</style> 
 
 