<template>
  <div class="beast-avatar" :class="[`beast-${beastType}`, `stage-${stage}`]">
    <svg viewBox="0 0 200 200" class="beast-svg" :class="{ 'hit-shake': isHit }">
      <defs>
        <linearGradient id="gradient-wood" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#66BB6A" />
          <stop offset="100%" style="stop-color:#4CAF50" />
        </linearGradient>
        <linearGradient id="gradient-fire" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF7043" />
          <stop offset="100%" style="stop-color:#FF5722" />
        </linearGradient>
        <linearGradient id="gradient-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#BDBDBD" />
          <stop offset="100%" style="stop-color:#9E9E9E" />
        </linearGradient>
        <linearGradient id="gradient-water" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#42A5F5" />
          <stop offset="100%" style="stop-color:#2196F3" />
        </linearGradient>
        <linearGradient id="gradient-light" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFD54F" />
          <stop offset="100%" style="stop-color:#FFC107" />
        </linearGradient>
        <filter id="glow-filter" v-if="stage >= 4">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g :filter="stage >= 4 ? 'url(#glow-filter)' : ''">
        <path :d="beastPath" class="beast-body" :fill="gradientId" />
        <circle v-if="stage >= 3" class="element-glow" cx="100" cy="100" r="80" />
      </g>
    </svg>
    <div v-if="activeSkill" class="skill-effect" :class="`effect-${activeSkill}`">
      <div class="effect-particles"></div>
      <div class="effect-flash"></div>
    </div>
    <div class="stage-badge" v-if="showStage">
      <span class="stage-text">{{ stageLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  beastType: string
  stage: number
  isHit?: boolean
  activeSkill?: string
  showStage?: boolean
}>()

const elementMap: Record<string, string> = {
  dragon: 'wood',
  phoenix: 'fire',
  tiger: 'metal',
  turtle: 'water',
  kirin: 'light'
}

const stageNames: Record<number, string> = {
  1: '幼年期',
  2: '成年期',
  3: '进化期',
  4: '神圣期'
}

const beastPaths: Record<string, string> = {
  dragon: 'M50,150 Q100,50 150,150 L130,120 Q100,80 70,120 Z M60,130 Q40,140 30,150 L50,145 M140,130 Q160,140 170,150 L150,145',
  phoenix: 'M100,40 L80,80 L50,100 L80,120 L100,160 L120,120 L150,100 L120,80 Z M70,60 L40,40 M130,60 L160,40',
  tiger: 'M60,100 Q80,60 100,100 Q120,60 140,100 L140,140 Q120,160 100,140 Q80,160 60,140 Z M80,90 L85,95 M120,90 L115,95',
  turtle: 'M80,120 A60,60 0 1,0 120,120 A60,60 0 1,0 80,120 M100,80 L100,60 Q80,40 100,30 Q120,40 100,60',
  kirin: 'M80,80 L100,40 L120,80 L140,120 Q120,150 100,140 Q80,150 60,120 Z M100,30 L110,15 L100,20 L90,15 L100,30'
}

const element = computed(() => elementMap[props.beastType] || 'wood')
const gradientId = computed(() => `url(#gradient-${element.value})`)
const beastPath = computed(() => beastPaths[props.beastType] || beastPaths['dragon'])
const stageLabel = computed(() => stageNames[props.stage] || '幼年期')
const scale = computed(() => 1 + (props.stage - 1) * 0.1)
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.beast-avatar {
  position: relative;
  width: 160px;
  height: 160px;
  @include flex-center;
}

.beast-svg {
  width: 100%;
  height: 100%;
  animation: breathe 2s ease-in-out infinite;
  transform: scale(v-bind('scale'));

  &.hit-shake {
    animation: shake 0.5s ease-in-out;
  }
}

.beast-body {
  stroke: rgba(255,255,255,0.3);
  stroke-width: 2;
}

.element-glow {
  fill: none;
  stroke-width: 2;
  opacity: 0.3;
  animation: glow-ring 2s ease-in-out infinite;
}

.beast-dragon .element-glow { stroke: $color-element-wood; }
.beast-phoenix .element-glow { stroke: $color-element-fire; }
.beast-tiger .element-glow { stroke: $color-element-metal; }
.beast-turtle .element-glow { stroke: $color-element-water; }
.beast-kirin .element-glow { stroke: $color-element-light; }

.skill-effect {
  position: absolute;
  inset: 0;
}

.stage-badge {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: $color-dark-light;
  padding: 4px 12px;
  border-radius: 12px;
}

.stage-text {
  color: $color-text-secondary;
  font-size: 12px;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-10px); }
  40% { transform: translateX(10px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
}

@keyframes glow-ring {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.5; }
}
</style>