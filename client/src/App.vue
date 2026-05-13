<template>
  <router-view v-slot="{ Component, route }">
    <component :is="Component" :key="route.path" />
  </router-view>
</template>

<script setup lang="ts">
// 根组件，路由直接渲染页面组件
// BottomNav 由各页面自行控制显示
</script>

<style lang="scss">
@use '@/assets/styles/variables' as *;

#app {
  background: $color-dark-base;
  min-height: 100vh;
}
</style>