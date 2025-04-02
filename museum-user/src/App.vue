<script setup>
// 组件逻辑
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
/* 组件样式 */
:deep(html) {
  --el-color-primary: #1E4C88;
  --el-color-primary-light-3: #2a5ca0;
  --el-color-primary-light-5: #5783bc;
  --el-color-primary-light-7: #a4b9d7;
  --el-color-primary-light-9: #e6eef8;
  --el-color-primary-dark-2: #153a6b;
}
</style>
