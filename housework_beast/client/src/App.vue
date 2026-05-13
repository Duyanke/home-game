<template>
  <router-view v-slot="{ Component, route }">
    <component :is="Component" :key="route.path" />
  </router-view>
  <Toast />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Toast from '@/components/common/Toast.vue'
import { useToastStore } from '@/stores/toast'
import { useBeastStore } from '@/stores/beast'
import { useBattleStore } from '@/stores/battle'
import { registerSocketCallback, removeSocketCallback, getSocket, setupSocketErrorHandlers } from '@/services/socket'
import { processQueue } from '@/utils/offlineQueue'

const toast = useToastStore()
const beastStore = useBeastStore()
const battleStore = useBattleStore()

// BEAST_SELECTED 回调
const onBeastSelected = (data: { payload: { success: boolean; beast?: any } }) => {
  if (data.payload.success && data.payload.beast) {
    beastStore.setMyBeast({
      id: data.payload.beast.id,
      memberId: data.payload.beast.memberId,
      type: data.payload.beast.type,
      stage: data.payload.beast.stage,
      stats: data.payload.beast.stats,
      skills: data.payload.beast.skills || [],
      growthPoints: data.payload.beast.growthPoints || 0
    })
    toast.success('神兽选择成功!')
  }
}

// DUEL_REJECTED 回调（全局）
const onDuelRejected = () => {
  toast.info('对手拒绝了决斗邀请')
}

// DUEL_STARTED 回调（全局）- 存储战斗状态
const onDuelStarted = (data: { payload: any }) => {
  console.log('[App] DUEL_STARTED received:', data.payload)
  battleStore.initDuel(data.payload)
}

// DUEL_ACTION_RESULT 回调（全局）
const onDuelActionResult = (data: { payload: { duelId: string; action: { actor: string; actionType: string; damage?: number; targetHp?: number }; actor: string } }) => {
  console.log('[App] DUEL_ACTION_RESULT:', data.payload)
  const result = data.payload.action
  if (result.targetHp !== undefined) {
    // actor 是 'challenger' 或 'defender'，需要反转来更新目标 HP
    battleStore.updateHp(result.actor === 'challenger' ? 'defender' : 'challenger', result.targetHp)
  }
}

// ROUND_ENDED 回调（全局）
const onRoundEnded = (data: { payload: { round: number; myEp?: number; opponentEp?: number } }) => {
  console.log('[App] ROUND_ENDED:', data.payload)
  battleStore.nextRound(data.payload.round)
}

// DUEL_ENDED 回调（全局）
const onDuelEnded = (data: { payload: { winnerId: string } }) => {
  console.log('[App] DUEL_ENDED:', data.payload)
  battleStore.endDuel(data.payload.winnerId)
}

onMounted(() => {
  // 监听网络状态
  window.addEventListener('online', () => {
    toast.success('网络已恢复')
    const count = processQueue()
    if (count > 0) {
      toast.info(`已自动提交 ${count} 个离线操作`)
    }
  })

  window.addEventListener('offline', () => {
    toast.warning('网络已断开，部分操作将在恢复后自动提交')
  })

  // 注册全局 Socket 事件回调
  registerSocketCallback('BEAST_SELECTED', onBeastSelected)
  registerSocketCallback('DUEL_REJECTED', onDuelRejected)
  registerSocketCallback('DUEL_STARTED', onDuelStarted)
  registerSocketCallback('DUEL_ACTION_RESULT', onDuelActionResult)
  registerSocketCallback('ROUND_ENDED', onRoundEnded)
  registerSocketCallback('DUEL_ENDED', onDuelEnded)

  // 设置错误处理
  const socket = getSocket()
  if (socket) {
    setupSocketErrorHandlers(socket, {
      onError: (msg: string) => toast.error(msg),
      onDisconnect: () => toast.warning('连接已断开，正在尝试重连...'),
      onReconnect: () => toast.success('重新连接成功')
    })
  }
})

onUnmounted(() => {
  removeSocketCallback('BEAST_SELECTED', onBeastSelected)
  removeSocketCallback('DUEL_REJECTED', onDuelRejected)
  removeSocketCallback('DUEL_STARTED', onDuelStarted)
  removeSocketCallback('DUEL_ACTION_RESULT', onDuelActionResult)
  removeSocketCallback('ROUND_ENDED', onRoundEnded)
  removeSocketCallback('DUEL_ENDED', onDuelEnded)
  window.removeEventListener('online', () => {})
  window.removeEventListener('offline', () => {})
})
</script>

<style lang="scss">
@use '@/assets/styles/variables' as *;

#app {
  background: $color-dark-base;
  min-height: 100vh;
}
</style>