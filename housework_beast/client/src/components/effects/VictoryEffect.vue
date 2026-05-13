<template>
  <div class="victory-effect" v-if="active" :class="{ 'is-victory': isVictory }">
    <div class="victory-backdrop"></div>
    <div class="victory-content">
      <div class="result-badge">
        <span class="badge-icon">{{ isVictory ? '🏆' : '💔' }}</span>
        <span class="badge-text">{{ isVictory ? '胜利!' : '失败...' }}</span>
      </div>
      <div class="result-particles" v-if="isVictory">
        <span class="star" v-for="i in 12" :key="i"
          :style="{
            '--delay': `${i * 0.1}s`,
            '--angle': `${i * 30}deg`,
            '--distance': `${60 + Math.random() * 40}px`
          }">
          ⭐
        </span>
      </div>
      <button class="continue-btn" @click="$emit('complete')">继续</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  active: boolean
  isVictory: boolean
}>()

const emit = defineEmits<{
  complete: []
}>()
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.victory-effect {
  position: fixed;
  inset: 0;
  z-index: 300;
  @include flex-center;
}

.victory-backdrop {
  position: absolute;
  inset: 0;
  background: rgba($color-dark-deep, 0.9);
  animation: fadeIn 0.3s ease-out;
}

.victory-content {
  position: relative;
  @include flex-center;
  @include flex-column;
  gap: 24px;
}

.result-badge {
  @include flex-center;
  @include flex-column;
  animation: victory-expand 0.8s ease-out forwards;

  &.is-victory {
    animation: victory-expand 0.8s ease-out forwards;
  }
}

.victory-effect:not(.is-victory) .result-badge {
  animation: defeat-fade 0.5s ease-out forwards, defeat-shake 0.5s ease-out;
}

.badge-icon {
  font-size: 72px;
}

.badge-text {
  font-size: 36px;
  font-weight: 700;
}

.is-victory .badge-text {
  color: $color-gold;
}

.victory-effect:not(.is-victory) .badge-text {
  color: $color-text-secondary;
}

.result-particles {
  position: absolute;
  width: 300px;
  height: 300px;

  .star {
    position: absolute;
    font-size: 20px;
    top: 50%;
    left: 50%;
    animation: victory-stars 1.5s ease-out forwards;
    animation-delay: var(--delay);
    transform: rotate(var(--angle)) translateX(var(--distance));
    transform-origin: center center;
  }
}

.continue-btn {
  @include button-primary;
  padding: 16px 48px;
  font-size: 18px;
}
</style>