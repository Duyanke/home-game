<template>
  <div class="page-container duel-page">
    <BackHeader title="决斗大厅" />
    <div class="page-content">
      <div class="my-record" v-if="myRecord">
        <h4 class="record-title">我的战绩</h4>
        <div class="record-stats">
          <span class="stat wins">{{ myRecord.wins }}胜</span>
          <span class="stat losses">{{ myRecord.losses }}负</span>
          <span class="stat streak" v-if="myRecord.streak > 0">
            {{ myRecord.streak }}连胜
          </span>
        </div>
      </div>
      <h4 class="opponents-title">在线对手</h4>
      <div class="opponents-list">
        <OpponentCard
          v-for="opponent in onlineOpponents"
          :key="opponent.id"
          :opponent="opponent"
          :win-record="winRecords[opponent.id]"
          @duel="startDuel"
        />
      </div>
      <div class="empty-hint" v-if="onlineOpponents.length === 0">
        暂无在线对手
      </div>
    </div>
    <BottomNav />
    <Loading :visible="isWaiting" text="等待对手响应..." />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@/components/common/BackHeader.vue'
import OpponentCard from '@/components/duel/OpponentCard.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import Loading from '@/components/common/Loading.vue'
import { useFamilyStore } from '@/stores/family'
import { useBeastStore } from '@/stores/beast'
import { useBattleStore } from '@/stores/battle'
import { useToastStore } from '@/stores/toast'
import { sendMessage, getSocket, rejoinFamily, registerSocketCallback, removeSocketCallback } from '@/services/socket'

const router = useRouter()
const familyStore = useFamilyStore()
const beastStore = useBeastStore()
const battleStore = useBattleStore()
const toast = useToastStore()
const isWaiting = ref(false)
const winRecords = ref<Record<string, { wins: number; losses: number }>>({})
const myRecord = ref<{ wins: number; losses: number; streak: number } | null>(null)

const onlineOpponents = computed(() => {
  return familyStore.members
    .filter(m => m.id !== familyStore.memberId && m.isOnline && m.beastType)
    .map(m => ({
      ...m,
      beastStage: beastStore.allBeasts.find(b => b.memberId === m.id)?.stage || 1
    }))
})

const startDuel = (opponentId: string) => {
  console.log('[DuelPage] startDuel called, opponentId:', opponentId);
  console.log('[DuelPage] familyStore.memberId:', familyStore.memberId);
  console.log('[DuelPage] familyStore.familyId:', familyStore.familyId);

  // 确保 socket 映射正确
  const socket = getSocket()
  if (socket && socket.connected && familyStore.memberId && familyStore.familyId) {
    rejoinFamily(familyStore.memberId, familyStore.familyId)
  }

  console.log('[DuelPage] Sending DUEL_INVITE');
  sendMessage('DUEL_INVITE', { challengerId: familyStore.memberId, defenderId: opponentId })
  isWaiting.value = true
}

// 决斗开始回调 - 初始化 battleStore 并路由跳转
const onDuelStarted = (data: { payload: { duelId: string; challengerId: string; defenderId: string; challengerState: any; defenderState: any; firstActor: string; currentRound: number; waitingFor: string } }) => {
  console.log('[DuelPage] DUEL_STARTED:', data.payload)
  isWaiting.value = false

  // 初始化 battleStore（确保状态在跳转前准备好）
  battleStore.initDuel(data.payload)

  router.push(`/battle/${data.payload.duelId}`)
}

// 收到决斗邀请回调
const onDuelInviteReceived = (data: { payload: { duelId: string; challengerId: string; challengerName?: string } }) => {
  console.log('[DuelPage] DUEL_INVITE_RECEIVED:', data.payload);
  const challengerName = data.payload.challengerName || '对手'
  toast.info(`${challengerName} 向你发起决斗邀请`)

  // 自动接受决斗并发送 DUEL_ACCEPT
  console.log('[DuelPage] Sending DUEL_ACCEPT, duelId:', data.payload.duelId, 'defenderId:', familyStore.memberId);
  sendMessage('DUEL_ACCEPT', { duelId: data.payload.duelId, defenderId: familyStore.memberId })
}

onMounted(() => {
  // 注册事件回调
  registerSocketCallback('DUEL_STARTED', onDuelStarted)
  registerSocketCallback('DUEL_INVITE_RECEIVED', onDuelInviteReceived)
})

onUnmounted(() => {
  removeSocketCallback('DUEL_STARTED', onDuelStarted)
  removeSocketCallback('DUEL_INVITE_RECEIVED', onDuelInviteReceived)
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.duel-page {
  background: $color-dark-base;
}

.my-record {
  @include card-base;
  margin-bottom: 24px;
}

.record-title {
  @include text-secondary;
  font-size: 14px;
  margin-bottom: 12px;
}

.record-stats {
  display: flex;
  gap: 16px;
}

.stat {
  font-size: 16px;
  font-weight: 600;

  &.wins { color: $color-success; }
  &.losses { color: $color-error; }
  &.streak { color: $color-gold; }
}

.opponents-title {
  @include text-title;
  margin-bottom: 16px;
}

.opponents-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-hint {
  @include text-secondary;
  text-align: center;
  padding: 48px;
}
</style>