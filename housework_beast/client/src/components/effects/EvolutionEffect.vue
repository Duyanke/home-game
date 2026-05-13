<template>
  <div class="evolution-effect" v-if="active">
    <div class="evolution-backdrop"></div>
    <div class="evolution-content">
      <div class="evolution-ring" :class="`element-${element}`"></div>
      <div class="evolution-particles">
        <span class="particle" v-for="i in 12" :key="i"
          :style="{ '--delay': `${i * 0.08}s`, '--angle': `${i * 30}deg` }">
        </span>
      </div>
      <div class="evolution-text">
        <span class="stage-name">{{ stageName }}</span>
        <span class="unlock-text" v-if="newSkill">解锁技能: {{ newSkill }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{
  active: boolean
  element: string
  stageName: string
  newSkill?: string
}>()

const emit = defineEmits<{
  complete: []
}>()

watch(() => props.active, (val) => {
  if (val) {
    setTimeout(() => emit('complete'), 2500)
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.evolution-effect {
  position: fixed;
  inset: 0;
  z-index: 300;
  @include flex-center;
}

.evolution-backdrop {
  position: absolute;
  inset: 0;
  background: rgba($color-dark-deep, 0.85);
  animation: fadeIn 0.3s ease-out;
}

.evolution-content {
  position: relative;
  @include flex-center;
  @include flex-column;
}

.evolution-ring {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 4px solid;
  animation: evolve-ring-expand 1.5s ease-out forwards;

  &.element-wood { border-color: $color-element-wood; }
  &.element-fire { border-color: $color-element-fire; }
  &.element-metal { border-color: $color-element-metal; }
  &.element-water { border-color: $color-element-water; }
  &.element-light { border-color: $color-element-light; }
}

.evolution-particles {
  position: absolute;
  width: 200px;
  height: 200px;

  .particle {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $color-gold;
    top: 50%;
    left: 50%;
    animation: evolve-particles 1s ease-out forwards;
    animation-delay: var(--delay);
    transform: rotate(var(--angle)) translateY(0);
    transform-origin: center center;
  }

  .particle:nth-child(1) { background: #FFE082; }
  .particle:nth-child(2) { background: #FFD54F; }
  .particle:nth-child(3) { background: #FFCA28; }
  .particle:nth-child(4) { background: #FFB300; }
  .particle:nth-child(5) { background: #FFA000; }
}

.evolution-text {
  position: absolute;
  text-align: center;
  animation: evolve-text-appear 2s ease-out forwards;
}

.stage-name {
  font-size: 28px;
  font-weight: 700;
  color: $color-gold;
  display: block;
}

.unlock-text {
  font-size: 16px;
  color: $color-text-primary;
  margin-top: 8px;
  display: block;
}
</style>