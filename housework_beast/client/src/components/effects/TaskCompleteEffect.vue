<template>
  <div class="task-complete-overlay" v-if="active">
    <div class="task-backdrop"></div>
    <div class="task-content">
      <div class="celebrate-icon">✨</div>
      <div class="confetti">
        <span class="confetti-piece" v-for="(color, i) in confettiColors" :key="i"
          :style="{
            '--delay': `${i * 0.04}s`,
            '--x': `${(Math.random() - 0.5) * 300}px`,
            '--color': color
          }">
        </span>
      </div>
      <div class="points-display">+{{ points }} 积分</div>
      <span class="complete-text">任务完成!</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'

const props = defineProps<{
  active: boolean
  points: number
}>()

const emit = defineEmits<{
  complete: []
}>()

const confettiColors = computed(() => {
  const colors = ['#FFC107', '#4CAF50', '#2196F3', '#FF9800', '#FF8A65']
  return Array.from({ length: 20 }, (_, i) => colors[i % 5])
})

watch(() => props.active, (val) => {
  if (val) {
    setTimeout(() => emit('complete'), 2000)
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.task-complete-overlay {
  position: fixed;
  inset: 0;
  z-index: 280;
  @include flex-center;
}

.task-backdrop {
  position: absolute;
  inset: 0;
  background: rgba($color-dark-deep, 0.7);
  animation: fadeIn 0.2s ease-out;
}

.task-content {
  position: relative;
  @include flex-center;
  @include flex-column;
}

.celebrate-icon {
  font-size: 64px;
  animation: celebrate-bounce 1s ease-out;
}

.confetti {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;

  .confetti-piece {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background: var(--color);
    top: 50%;
    left: 50%;
    animation: celebrate-confetti 1.5s ease-out forwards;
    animation-delay: var(--delay);
  }
}

.points-display {
  font-size: 32px;
  font-weight: 700;
  color: $color-gold;
  animation: points-pop 1.5s ease-out forwards;
  margin-top: 20px;
}

.complete-text {
  font-size: 18px;
  color: $color-text-primary;
  opacity: 0.8;
  margin-top: 8px;
}
</style>