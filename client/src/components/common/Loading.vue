<template>
  <div class="loading-overlay" v-if="visible">
    <div class="loading-spinner">
      <div class="spinner-ring"></div>
      <span class="loading-text" v-if="text">{{ text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  text?: string
}>()
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba($color-dark-deep, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner-ring {
  width: 48px;
  height: 48px;
  border: 4px solid $color-dark-light;
  border-top-color: $color-gold;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: $color-text-secondary;
  font-size: 14px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>