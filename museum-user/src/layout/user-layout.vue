<template>
  <div class="user-layout-container">
    <div class="app-content">
      <router-view v-slot="{ Component }">
        <transition name="fade-transform" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <BottomNavigator />
  </div>
</template>

<script setup>
import BottomNavigator from '@/components/BottomNavigator.vue';
</script>

<style lang="scss" scoped>
.user-layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  
  .app-content {
    flex: 1;
    padding-bottom: 60px; /* 为底部导航栏预留空间 */
  }
}

.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 