<template>
  <router-view v-slot="{ Component, route }">
    <component :is="Component" :key="route.path" />
  </router-view>
  <Toast />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Toast from '@/components/common/Toast.vue'
import { useToastStore } from '@/stores/toast'
import { getSocket, setupSocketErrorHandlers } from '@/services/socket'
import { processQueue } from '@/utils/offlineQueue'

const toast = useToastStore()

onMounted(() => {
  // 监听网络状态
  window.addEventListener('online', () => {
    toast.success('网络已恢复')
    // 处理离线期间的操作队列
    const count = processQueue()
    if (count > 0) {
      toast.info(`已自动提交 ${count} 个离线操作`)
    }
  })

  window.addEventListener('offline', () => {
    toast.warning('网络已断开，部分操作将在恢复后自动提交')
  })

  // 设置Socket错误处理
  const socket = getSocket()
  if (socket) {
    setupSocketErrorHandlers(socket, {
      onError: (msg: string) => toast.error(msg),
      onDisconnect: () => toast.warning('连接已断开，正在尝试重连...'),
      onReconnect: () => toast.success('重新连接成功')
    })
  }
})
</script>

<style lang="scss">
@use '@/assets/styles/variables' as *;

#app {
  background: $color-dark-base;
  min-height: 100vh;
}
</style>