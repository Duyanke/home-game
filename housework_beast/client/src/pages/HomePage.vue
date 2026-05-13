<template>
  <div class="page-container home-page">
    <!-- 新用户欢迎界面 -->
    <WelcomeModal v-if="!hasFamilyInfo" @success="onWelcomeSuccess" />

    <!-- 已有家庭信息的用户 -->
    <div v-else class="page-content">
      <FamilyCodeCard :family-code="familyStore.familyCode" />
      <RankList />
      <NavCards />
    </div>
    <BottomNav v-if="hasFamilyInfo" />
    <Loading :visible="isLoading" text="加载中..." />
    <ConnectionStatus
      v-if="hasFamilyInfo"
      :connected="isConnected"
      :reconnecting="isReconnecting"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import WelcomeModal from '@/components/common/WelcomeModal.vue'
import FamilyCodeCard from '@/components/home/FamilyCodeCard.vue'
import RankList from '@/components/home/RankList.vue'
import NavCards from '@/components/home/NavCards.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import Loading from '@/components/common/Loading.vue'
import ConnectionStatus from '@/components/common/ConnectionStatus.vue'
import { useFamilyStore } from '@/stores/family'
import type { Member } from '@/stores/family'
import { connectSocket, getSocket } from '@/services/socket'

const familyStore = useFamilyStore()
const isLoading = ref(true)
const isConnected = ref(false)
const isReconnecting = ref(false)

const hasFamilyInfo = computed(() => {
  return familyStore.familyCode && familyStore.memberId
})

let socket: ReturnType<typeof connectSocket> | null = null

// 尝试从本地存储恢复家庭信息
const restoreFromStorage = () => {
  const savedCode = localStorage.getItem('familyCode')
  const savedId = localStorage.getItem('memberId')
  const savedName = localStorage.getItem('memberName')
  const savedFamilyId = localStorage.getItem('familyId')

  if (savedCode && savedId && savedName && savedFamilyId) {
    familyStore.setFamilyInfo(savedFamilyId, savedCode, savedId, savedName)
  }
}

// 欢迎组件成功回调
const onWelcomeSuccess = () => {
  // Socket 已经在 WelcomeModal 中连接，直接使用
  socket = getSocket()

  if (socket && socket.connected) {
    // 已连接，立即完成加载
    isConnected.value = true
    isLoading.value = false

    // 设置事件监听
    setupSocketEvents(socket)

    // 请求同步数据
    requestSync(socket)
  } else if (socket) {
    // 等待连接
    isLoading.value = true
    setupSocketEvents(socket)
  }
}

// 设置 Socket 事件监听
const setupSocketEvents = (sock: ReturnType<typeof connectSocket>) => {
  sock.on('connect', () => {
    isConnected.value = true
    isReconnecting.value = false
    isLoading.value = false
    requestSync(sock)
  })

  sock.on('disconnect', () => {
    isConnected.value = false
    isReconnecting.value = true
  })

  sock.on('reconnect', () => {
    isReconnecting.value = false
    isConnected.value = true
    requestSync(sock)
  })

  sock.on('reconnect_attempt', () => {
    isReconnecting.value = true
  })

  // 监听广播事件
  sock.on('BROADCAST', (data: { payload: { event: string; data: any } }) => {
    handleBroadcast(data.payload.event, data.payload.data)
  })

  // 监听同步数据
  sock.on('SYNC_DATA', (data: { payload: { members: Member[] } }) => {
    familyStore.syncMembers(data.payload.members)
  })
}

// 请求数据同步
const requestSync = (sock: ReturnType<typeof connectSocket>) => {
  if (familyStore.familyId) {
    sock.emit('SYNC_REQUEST', {
      type: 'SYNC_REQUEST',
      payload: { familyId: familyStore.familyId },
      timestamp: Date.now()
    })
  }
}

// 处理广播事件
const handleBroadcast = (event: string, data: any) => {
  switch (event) {
    case 'MEMBER_JOINED':
      // 新成员加入，重新同步
      if (socket) requestSync(socket)
      break
    case 'MEMBER_STATUS_UPDATED':
      familyStore.updateMemberStatus(data.memberId, data.status === 'online')
      break
    case 'MEMBER_POINTS_UPDATED':
      familyStore.updateMemberPoints(data.memberId, data.newPoints)
      break
    case 'TASK_CREATED':
    case 'TASK_UPDATED':
      // 由 task store 处理
      break
    case 'BEAST_STAGE_UP':
      // 神兽成长
      break
  }
}

// 初始化 Socket 连接（用于恢复存储数据的情况）
const initSocketConnection = () => {
  socket = connectSocket('http://localhost:3000')

  setupSocketEvents(socket)

  // 监听网络状态
  window.addEventListener('online', () => {
    isConnected.value = navigator.onLine
    if (!socket?.connected) {
      socket?.connect()
    }
  })

  window.addEventListener('offline', () => {
    isConnected.value = false
  })
}

onMounted(() => {
  restoreFromStorage()

  if (hasFamilyInfo.value) {
    initSocketConnection()
  } else {
    isLoading.value = false
  }
})

onUnmounted(() => {
  if (socket) {
    socket.off('connect')
    socket.off('disconnect')
    socket.off('reconnect')
    socket.off('reconnect_attempt')
    socket.off('BROADCAST')
    socket.off('SYNC_DATA')
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