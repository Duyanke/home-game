<template>
  <nav class="bottom-nav">
    <router-link
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { path: '/', icon: '🏠', label: '首页' },
  { path: '/beast', icon: '🐉', label: '神兽' },
  { path: '/task', icon: '📋', label: '任务' },
  { path: '/duel', icon: '⚔️', label: '决斗' }
]

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: $nav-height;
  background: $color-dark-light;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid $color-dark-deep;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  color: $color-text-secondary;
  text-decoration: none;
  transition: color 0.2s;

  &.active {
    color: $color-gold;
  }

  .nav-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .nav-label {
    font-size: 12px;
  }
}
</style>