<template>
  <div class="nav-cards">
    <div
      class="nav-card"
      :class="`card-${item.color}`"
      v-for="item in navItems"
      :key="item.path"
      @click="navigateTo(item.path)"
    >
      <span class="card-icon">{{ item.icon }}</span>
      <span class="card-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navItems = [
  { path: '/beast', icon: '🐉', label: '我的神兽', color: 'green' },
  { path: '/task', icon: '📋', label: '任务中心', color: 'red' },
  { path: '/duel', icon: '⚔️', label: '发起决斗', color: 'gold' }
]

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.nav-cards {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.nav-card {
  flex: 1;
  padding: 20px;
  border-radius: $card-radius;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }

  &.card-green {
    @include gradient-green;
    color: white;
  }

  &.card-red {
    @include gradient-red;
    color: white;
  }

  &.card-gold {
    @include gradient-gold;
    color: $color-dark-base;
  }
}

.card-icon {
  font-size: 32px;
}

.card-label {
  font-size: 14px;
  font-weight: 600;
}
</style>