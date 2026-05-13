<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        class="toast-item"
        :class="msg.type"
        v-for="msg in toastStore.messages"
        :key="msg.id"
        @click="toastStore.remove(msg.id)"
      >
        <span class="toast-icon">{{ icons[msg.type] }}</span>
        <span class="toast-message">{{ msg.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

const icons: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 90%;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  animation: toast-in 0.3s ease-out;

  &.success {
    background: rgba($color-success, 0.9);
    color: white;
  }

  &.error {
    background: rgba($color-error, 0.9);
    color: white;
  }

  &.warning {
    background: rgba($color-warning, 0.9);
    color: $color-dark-base;
  }

  &.info {
    background: rgba($color-info, 0.9);
    color: white;
  }
}

.toast-icon {
  font-size: 18px;
  font-weight: 700;
}

.toast-message {
  font-size: 14px;
  line-height: 1.4;
}

.toast-enter-active {
  animation: toast-in 0.3s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.2s ease-in forwards;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(50px);
  }
}
</style>