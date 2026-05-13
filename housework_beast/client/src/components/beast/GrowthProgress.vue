<template>
  <div class="growth-progress">
    <div class="growth-header">
      <span class="growth-label">成长进度</span>
      <span class="growth-stage">{{ stageLabel }}</span>
    </div>
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: `${progressPercent}%` }"
      ></div>
    </div>
    <div class="progress-info">
      <span class="current-points">{{ currentPoints }}</span>
      <span class="threshold-points">/{{ threshold }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPoints: number
  stage: number
}>()

const stageNames: Record<number, string> = {
  1: '幼年期',
  2: '成年期',
  3: '进化期',
  4: '神圣期'
}

const stageThresholds: Record<number, number> = {
  1: 0,
  2: 100,
  3: 300,
  4: 600
}

const stageLabel = computed(() => stageNames[props.stage] || '幼年期')
const threshold = computed(() => stageThresholds[props.stage + 1] || stageThresholds[4])
const progressPercent = computed(() => {
  const prevThreshold = stageThresholds[props.stage] || 0
  const nextThreshold = threshold.value
  const range = nextThreshold - prevThreshold
  const progress = props.currentPoints - prevThreshold
  return Math.min(Math.max((progress / range) * 100, 0), 100)
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.growth-progress {
  @include card-base;
  margin-top: 24px;
}

.growth-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.growth-label {
  @include text-secondary;
  font-size: 14px;
}

.growth-stage {
  color: $color-gold;
  font-size: 14px;
  font-weight: 600;
}

.progress-bar {
  height: 12px;
  background: $color-dark-deep;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: $color-gold;
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-info {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
}

.current-points {
  color: $color-gold;
  font-size: 14px;
  font-weight: 600;
}

.threshold-points {
  @include text-secondary;
  font-size: 14px;
}
</style>