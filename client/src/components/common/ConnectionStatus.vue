<template>
  <div class="connection-status" :class="statusClass">
    <span class="status-dot"></span>
    <span class="status-text">{{ statusText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  connected: boolean
  reconnecting?: boolean
}>()

const statusClass = computed(() => {
  if (props.reconnecting) return 'reconnecting'
  return props.connected ? 'connected' : 'disconnected'
})

const statusText = computed(() => {
  if (props.reconnecting) return '重连中...'
  return props.connected ? '已连接' : '未连接'
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: $button-radius;
  font-size: 12px;

  &.connected {
    background: rgba($color-success, 0.2);
    color: $color-success;
    .status-dot { background: $color-success; }
  }

  &.disconnected {
    background: rgba($color-error, 0.2);
    color: $color-error;
    .status-dot { background: $color-error; }
  }

  &.reconnecting {
    background: rgba($color-warning, 0.2);
    color: $color-warning;
    .status-dot {
      background: $color-warning;
      animation: pulse 1s infinite;
    }
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>