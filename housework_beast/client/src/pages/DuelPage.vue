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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@/components/common/BackHeader.vue'
import OpponentCard from '@/components/duel/OpponentCard.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import Loading from '@/components/common/Loading.vue'
import { useFamilyStore } from '@/stores/family'
import { useBeastStore } from '@/stores/beast'
import { sendMessage, getSocket } from '@/services/socket'

const router = useRouter()
const familyStore = useFamilyStore()
const beastStore = useBeastStore()
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
  sendMessage('START_DUEL', { opponentId })
  isWaiting.value = true
}

onMounted(() => {
  const socket = getSocket()
  if (socket) {
    socket.on('DUEL_STARTED', (data) => {
      isWaiting.value = false
      router.push(`/battle/${data.payload.duelId}`)
    })

    socket.on('DUEL_DECLINED', () => {
      isWaiting.value = false
    })
  }
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