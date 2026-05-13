<template>
  <div class="battle-log">
    <h4 class="log-title">战斗日志</h4>
    <div class="log-items">
      <div
        class="log-item"
        v-for="(log, index) in logs"
        :key="index"
        :class="`log-${log.type}`"
      >
        <span class="log-round">回合{{ log.round }}</span>
        <span class="log-action">{{ log.action }}</span>
        <span class="log-result" v-if="log.damage">{{ log.damage }}伤害</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  logs: Array<{
    round: number
    type: 'attack' | 'skill' | 'defend' | 'heal'
    action: string
    damage?: number
  }>
}>()
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.battle-log {
  @include card-base;
  max-height: 200px;
  overflow-y: auto;
}

.log-title {
  @include text-primary;
  font-size: 14px;
  margin-bottom: 12px;
}

.log-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: $color-dark-deep;
  border-radius: $button-radius;
}

.log-round {
  @include text-secondary;
  font-size: 12px;
}

.log-action {
  @include text-primary;
  font-size: 12px;
  flex: 1;
}

.log-result {
  font-size: 12px;

  &.log-attack { color: $color-red; }
  &.log-skill { color: $color-warning; }
  &.log-defend { color: $color-info; }
  &.log-heal { color: $color-success; }
}
</style>