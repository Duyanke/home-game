<template>
  <header class="back-header">
    <button class="back-btn" @click="goBack">
      <span class="back-icon">←</span>
    </button>
    <h1 class="header-title">{{ title }}</h1>
    <div class="header-extra" v-if="$slots.extra">
      <slot name="extra"></slot>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  title: string
}>()

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.back-header {
  height: $header-height;
  background: $color-dark-light;
  display: flex;
  align-items: center;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.back-btn {
  background: transparent;
  border: none;
  color: $color-text-primary;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  margin-right: 8px;

  &:hover {
    color: $color-gold;
  }
}

.header-title {
  flex: 1;
  @include text-title;
}

.header-extra {
  display: flex;
  align-items: center;
}
</style>