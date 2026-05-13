<template>
  <div class="opponent-card" :class="{ offline: !opponent.isOnline }">
    <div class="opponent-avatar">
      <BeastAvatar
        :beast-type="opponent.beastType || 'dragon'"
        :stage="opponent.beastStage || 1"
        :show-stage="false"
      />
    </div>
    <div class="opponent-info">
      <span class="opponent-name">{{ opponent.name }}</span>
      <span class="opponent-beast">{{ beastLabel }}</span>
    </div>
    <div class="opponent-stats">
      <span class="stats-item">{{ opponent.points }}分</span>
      <span class="stats-item" v-if="winRecord">{{ winRecord.wins }}胜</span>
    </div>
    <button
      class="duel-btn"
      :disabled="!opponent.isOnline"
      @click="$emit('duel', opponent.id)"
    >
      {{ opponent.isOnline ? '发起决斗' : '离线' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BeastAvatar from '@/components/common/BeastAvatar.vue'

const props = defineProps<{
  opponent: {
    id: string
    name: string
    points: number
    beastType: string | null
    beastStage?: number
    isOnline: boolean
  }
  winRecord?: { wins: number; losses: number }
}>()

defineEmits<{
  duel: [memberId: string]
}>()

const beastNames: Record<string, string> = {
  dragon: '青龙',
  phoenix: '朱雀',
  tiger: '白虎',
  turtle: '玄武',
  kirin: '麒麟'
}

const beastLabel = computed(() => {
  if (!props.opponent.beastType) return ''
  return beastNames[props.opponent.beastType] || ''
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.opponent-card {
  @include card-base;
  display: flex;
  align-items: center;
  gap: 16px;

  &.offline {
    opacity: 0.6;
  }
}

.opponent-avatar {
  width: 60px;
  height: 60px;
}

.opponent-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.opponent-name {
  @include text-primary;
  font-size: 16px;
}

.opponent-beast {
  @include text-secondary;
  font-size: 12px;
}

.opponent-stats {
  display: flex;
  gap: 8px;
}

.stats-item {
  background: $color-dark-deep;
  padding: 4px 8px;
  border-radius: 4px;
  color: $color-gold;
  font-size: 12px;
}

.duel-btn {
  @include button-primary;
  padding: 8px 16px;

  &:disabled {
    background: $color-dark-deep;
    color: $color-text-secondary;
  }
}
</style>