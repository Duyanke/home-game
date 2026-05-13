<template>
  <div class="member-rank" :class="{ isMe: isMe }">
    <span class="rank-number">{{ rank }}</span>
    <div class="member-info">
      <span class="member-name">{{ member.name }}</span>
      <span class="beast-type" v-if="member.beastType">{{ beastLabel }}</span>
    </div>
    <div class="member-points">
      <span class="points-value">{{ member.points }}</span>
      <span class="points-label">积分</span>
    </div>
    <span class="online-badge" v-if="member.isOnline">在线</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  member: {
    id: string
    name: string
    points: number
    beastType: string | null
    isOnline: boolean
  }
  rank: number
  isMe?: boolean
}>()

const beastNames: Record<string, string> = {
  dragon: '青龙',
  phoenix: '朱雀',
  tiger: '白虎',
  turtle: '玄武',
  kirin: '麒麟'
}

const beastLabel = computed(() => {
  if (!props.member.beastType) return ''
  return beastNames[props.member.beastType] || ''
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.member-rank {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: $color-dark-light;
  border-radius: $card-radius;
  gap: 12px;

  &.isMe {
    background: linear-gradient(135deg, rgba($color-gold, 0.1), transparent);
    border: 1px solid $color-gold;
  }
}

.rank-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: $color-dark-deep;
  color: $color-text-primary;
  font-weight: 600;
  font-size: 14px;
}

.member-rank:nth-child(-n+3) .rank-number {
  background: $color-gold;
  color: $color-dark-base;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-name {
  color: $color-text-primary;
  font-size: 16px;
}

.beast-type {
  color: $color-text-secondary;
  font-size: 12px;
}

.member-points {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.points-value {
  color: $color-gold;
  font-size: 18px;
  font-weight: 600;
}

.points-label {
  color: $color-text-secondary;
  font-size: 12px;
}

.online-badge {
  background: rgba($color-success, 0.2);
  color: $color-success;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
}
</style>