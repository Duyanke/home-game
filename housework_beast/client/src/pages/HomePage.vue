<template>
  <div class="page-container home-page">
    <div class="page-content">
      <FamilyCodeCard :family-code="familyStore.familyCode" />
      <RankList />
      <NavCards />
    </div>
    <BottomNav />
    <Loading :visible="isLoading" text="加载中..." />
    <ConnectionStatus :connected="isConnected" :reconnecting="isReconnecting" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import FamilyCodeCard from '@/components/home/FamilyCodeCard.vue'
import RankList from '@/components/home/RankList.vue'
import NavCards from '@/components/home/NavCards.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import Loading from '@/components/common/Loading.vue'
import ConnectionStatus from '@/components/common/ConnectionStatus.vue'
import { useFamilyStore } from '@/stores/family'
import type { Member } from '@/stores/family'
import { connectSocket } from '@/services/socket'

const familyStore = useFamilyStore()
const isLoading = ref(true)
const isConnected = ref(false)
const isReconnecting = ref(false)

let socket: ReturnType<typeof connectSocket>

onMounted(async () => {
  // 初始化 Socket 连接
  socket = connectSocket('http://localhost:3000')

  socket.on('connect', () => {
    isConnected.value = true
    isReconnecting.value = false
    isLoading.value = false

    // 发送加入家庭请求
    if (familyStore.familyCode) {
      socket.emit('JOIN_FAMILY', {
        type: 'JOIN_FAMILY',
        payload: {
          familyCode: familyStore.familyCode,
          memberName: familyStore.memberName
        }
      })
    }
  })

  socket.on('disconnect', () => {
    isConnected.value = false
    isReconnecting.value = true
  })

  socket.on('reconnect', () => {
    isReconnecting.value = false
    isConnected.value = true
  })

  socket.on('reconnect_attempt', () => {
    isReconnecting.value = true
  })

  // 监听家庭同步事件
  socket.on('FAMILY_SYNC', (data: { payload: { members: Member[] } }) => {
    familyStore.syncMembers(data.payload.members)
  })

  // 监听浏览器网络状态
  window.addEventListener('online', () => {
    isConnected.value = navigator.onLine
    if (!socket.connected) {
      socket.connect()
    }
  })

  window.addEventListener('offline', () => {
    isConnected.value = false
  })
})

onUnmounted(() => {
  if (socket) {
    socket.off('connect')
    socket.off('disconnect')
    socket.off('reconnect')
    socket.off('reconnect_attempt')
    socket.off('FAMILY_SYNC')
  }
  window.removeEventListener('online', () => {})
  window.removeEventListener('offline', () => {})
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.home-page {
  background: $color-dark-base;
}
</style>