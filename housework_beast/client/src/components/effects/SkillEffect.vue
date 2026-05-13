<template>
  <div class="skill-effect-overlay" v-if="active" :class="`type-${skillType}`">
    <div class="skill-flash"></div>
    <div class="skill-particles">
      <span class="particle" v-for="i in 8" :key="i"
        :style="{
          '--tx': `${(Math.random() - 0.5) * 150}px`,
          '--ty': `${(Math.random() - 0.5) * 150}px`,
          '--delay': `${i * 0.05}s`
        }">
      </span>
    </div>
    <span class="skill-name">{{ skillName }}</span>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{
  active: boolean
  skillType: 'attack' | 'skill' | 'defend' | 'heal'
  skillName: string
}>()

const emit = defineEmits<{
  complete: []
}>()

watch(() => props.active, (val) => {
  if (val) {
    setTimeout(() => emit('complete'), 1200)
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.skill-effect-overlay {
  position: fixed;
  inset: 0;
  z-index: 250;
  @include flex-center;
  pointer-events: none;
}

.skill-flash {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  animation: skill-flash 0.8s ease-out forwards;
}

.type-attack .skill-flash {
  background: radial-gradient(circle, rgba($color-red, 0.8) 0%, transparent 70%);
}

.type-skill .skill-flash {
  background: radial-gradient(circle, rgba($color-warning, 0.8) 0%, transparent 70%);
}

.type-defend .skill-flash {
  background: radial-gradient(circle, rgba($color-info, 0.8) 0%, transparent 70%);
}

.type-heal .skill-flash {
  background: radial-gradient(circle, rgba($color-success, 0.8) 0%, transparent 70%);
}

.skill-particles {
  position: absolute;
  width: 200px;
  height: 200px;

  .particle {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    animation: skill-particle-burst 0.6s ease-out forwards;
    animation-delay: var(--delay);
  }
}

.type-attack .particle { background: $color-red-light; }
.type-skill .particle { background: $color-warning; }
.type-defend .particle { background: $color-info; }
.type-heal .particle { background: $color-green-light; }

.skill-name {
  position: absolute;
  font-size: 24px;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  animation: skill-name-flash 1s ease-out forwards;
}

.type-attack .skill-name { color: $color-red; }
.type-skill .skill-name { color: $color-warning; }
.type-defend .skill-name { color: $color-info; }
.type-heal .skill-name { color: $color-success; }
</style>