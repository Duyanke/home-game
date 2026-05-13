<template>
  <div class="beast-stats">
    <h4 class="stats-title">属性面板</h4>
    <div class="stat-bar" v-for="stat in stats" :key="stat.name">
      <div class="stat-header">
        <span class="stat-name">{{ stat.label }}</span>
        <span class="stat-value">{{ stat.value }}</span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${stat.percent}%` }"
          :class="stat.name"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  stats: { hp: number; atk: number; def: number; spd: number }
}>()

const stats = computed(() => {
  const maxStat = 100
  return [
    { name: 'hp', label: 'HP', value: props.stats.hp, percent: (props.stats.hp / maxStat) * 100 },
    { name: 'atk', label: 'ATK', value: props.stats.atk, percent: (props.stats.atk / maxStat) * 100 },
    { name: 'def', label: 'DEF', value: props.stats.def, percent: (props.stats.def / maxStat) * 100 },
    { name: 'spd', label: 'SPD', value: props.stats.spd, percent: (props.stats.spd / maxStat) * 100 }
  ]
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.beast-stats {
  @include card-base;
  margin-top: 24px;
}

.stats-title {
  @include text-primary;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.stat-bar {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.stat-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-name {
  @include text-secondary;
  font-size: 14px;
}

.stat-value {
  color: $color-text-primary;
  font-size: 14px;
  font-weight: 600;
}

.progress-bar {
  height: 8px;
  background: $color-dark-deep;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;

  &.hp { background: $color-success; }
  &.atk { background: $color-red; }
  &.def { background: $color-info; }
  &.spd { background: $color-warning; }
}
</style>