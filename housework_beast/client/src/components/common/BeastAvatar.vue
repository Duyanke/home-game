<template>
  <div class="beast-avatar" :class="[`beast-${normalizedType}`, `stage-${stage}`, `element-${element}`]">
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

// 拼音转英文映射（支持前后端命名不一致）
const nameMap: Record<string, string> = {
  qinglong: 'dragon',
  zhuque: 'phoenix',
  baihu: 'tiger',
  xuanwu: 'turtle',
  qilin: 'kirin'
}

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

// 5种神兽×4阶段SVG路径定义
const beastPaths: Record<string, Record<number, string>> = {
  dragon: {
    // 幼年期：小蛇形态
    1: 'M60,120 Q80,90 100,120 Q120,90 140,120 L140,160 Q100,180 60,160 Z M90,100 Q85,95 90,90 M110,100 Q115,95 110,90 M140,155 Q150,160 155,155',
    // 成年期：龙首蛇身
    2: 'M40,140 Q60,60 100,100 Q140,60 160,140 L150,180 Q100,200 50,180 Z M60,80 Q50,70 55,60 M140,80 Q150,70 145,60 M45,160 Q30,180 25,170',
    // 进化期：四爪龙
    3: 'M30,150 Q50,50 100,80 Q150,50 170,150 L160,190 Q100,210 40,190 Z M40,60 L20,50 M160,60 L180,50 M30,180 L15,200 M170,180 L185,200',
    // 神圣期：完整龙形+角
    4: 'M20,160 Q40,30 100,60 Q160,30 180,160 L170,200 Q100,220 30,200 Z M50,40 L40,20 L50,30 L60,20 L50,40 M150,40 L160,20 L150,30 L140,20 L150,40 M20,190 L5,210 M180,190 L195,210 M100,60 L90,45 L100,50 L110,45 L100,60'
  },
  phoenix: {
    // 幼年期：小火鸟
    1: 'M100,60 L90,90 L70,110 L90,130 L100,170 L110,130 L130,110 L110,90 Z M85,80 Q75,70 80,60 M115,80 Q125,70 120,60',
    // 成年期：展翅凤凰
    2: 'M100,50 L80,100 L40,120 L80,140 L100,180 L120,140 L160,120 L120,100 Z M60,90 L30,60 M140,90 L170,60 M100,50 L90,30 L100,35 L110,30 L100,50',
    // 进化期：火焰羽翼
    3: 'M100,40 L75,100 L30,130 L70,150 L100,190 L130,150 L170,130 L125,100 Z M50,80 L20,40 M150,80 L180,40 M100,40 L85,15 L100,25 L115,15 L100,40 M70,150 Q60,170 55,160 M130,150 Q140,170 145,160',
    // 神圣期：神圣凤凰+光环
    4: 'M100,30 L70,100 L20,140 L60,160 L100,200 L140,160 L180,140 L130,100 Z M40,70 L10,30 M160,70 L190,30 M100,30 L80,5 L100,15 L120,5 L100,30 M60,160 Q50,180 45,170 M140,160 Q150,180 155,170'
  },
  tiger: {
    // 幼年期：小虎崽
    1: 'M70,120 Q90,80 110,120 L120,160 Q100,180 80,160 Z M85,95 L95,100 M115,95 L105,100 M95,130 L105,130',
    // 成年期：猛虎形态
    2: 'M50,110 Q80,60 100,100 Q120,60 150,110 L160,160 Q100,190 40,160 Z M70,80 L55,70 M130,80 L145,70 M80,90 L90,95 M120,90 L110,95',
    // 进化期：威猛白虎
    3: 'M40,100 Q70,40 100,80 Q130,40 160,100 L170,170 Q100,200 30,170 Z M55,60 L35,40 M145,60 L165,40 M70,85 L85,95 M130,85 L115,95 M85,140 L115,140',
    // 神圣期：神圣白虎+虎纹
    4: 'M30,90 Q60,30 100,70 Q140,30 170,90 L180,180 Q100,210 20,180 Z M45,50 L25,30 M155,50 L175,30 M60,75 L80,90 M140,75 L120,90 M80,150 L120,150 M90,160 L110,160'
  },
  turtle: {
    // 幼年期：小龟
    1: 'M60,130 A50,50 0 1,0 140,130 A50,50 0 1,0 60,130 M100,100 L100,80 Q90,70 100,65 Q110,70 100,80',
    // 成年期：龟蛇合一
    2: 'M50,140 A60,60 0 1,0 150,140 A60,60 0 1,0 50,140 M100,110 L100,70 Q80,50 100,40 Q120,50 100,70 M70,90 Q50,100 45,120',
    // 进化期：完整玄武
    3: 'M40,150 A70,70 0 1,0 160,150 A70,70 0 1,0 40,150 M100,120 L100,60 Q70,40 100,30 Q130,40 100,60 M60,100 Q30,110 25,130 M140,100 Q170,110 175,130',
    // 神圣期：神圣玄武+蛇缠绕
    4: 'M30,160 A80,80 0 1,0 170,160 A80,80 0 1,0 30,160 M100,130 L100,50 Q60,30 100,20 Q140,30 100,50 M50,110 Q20,120 15,140 M150,110 Q180,120 185,140'
  },
  kirin: {
    // 幼年期：小麒麟
    1: 'M70,100 Q90,60 100,90 Q110,60 130,100 L140,150 Q100,170 60,150 Z M90,70 Q85,60 90,55 M110,70 Q115,60 110,55 M100,90 L95,75 L100,80 L105,75 L100,90',
    // 成年期：优雅麒麟
    2: 'M50,90 Q80,40 100,70 Q120,40 150,90 L160,160 Q100,190 40,160 Z M70,50 L50,30 M130,50 L150,30 M100,70 L90,50 L100,60 L110,50 L100,70',
    // 进化期：祥瑞麒麟
    3: 'M40,80 Q70,20 100,50 Q130,20 160,80 L170,170 Q100,200 30,170 Z M60,30 L40,10 M140,30 L160,10 M100,50 L85,25 L100,40 L115,25 L100,50 M70,170 Q60,190 55,180 M130,170 Q140,190 145,180',
    // 神圣期：神圣麒麟+光环
    4: 'M30,70 Q60,10 100,40 Q140,10 170,70 L180,180 Q100,210 20,180 Z M50,20 L30,0 M150,20 L170,0 M100,40 L80,15 L100,30 L120,15 L100,40 M60,180 Q50,200 45,190 M140,180 Q150,200 155,190'
  }
}

const normalizedType = computed(() => nameMap[props.beastType] || props.beastType)
const element = computed(() => elementMap[normalizedType.value] || 'wood')
const gradientId = computed(() => `url(#gradient-${element.value})`)
const beastPath = computed(() => {
  const typePaths = beastPaths[normalizedType.value] || beastPaths['dragon']
  return typePaths[props.stage] || typePaths[1]
})
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
  transform: scale(v-bind('scale'));

  &.hit-shake {
    animation: shake 0.5s ease-in-out;
  }
}

// 元素特色动画
.element-wood .beast-svg {
  animation: breathe 2s ease-in-out infinite, wood-sway 3s ease-in-out infinite;
}

.element-fire .beast-svg {
  animation: breathe 2s ease-in-out infinite, fire-pulse 1.5s ease-in-out infinite;
}

.element-metal .beast-svg {
  animation: breathe 2s ease-in-out infinite, metal-shine 2s ease-in-out infinite;
}

.element-water .beast-svg {
  animation: breathe 2s ease-in-out infinite, water-wave 2s ease-in-out infinite;
}

.element-light .beast-svg {
  animation: breathe 2s ease-in-out infinite, light-glow 1.5s ease-in-out infinite;
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

@keyframes wood-sway {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(2deg) scale(1.03); }
  75% { transform: rotate(-2deg) scale(1.03); }
}

@keyframes fire-pulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}

@keyframes metal-shine {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 1; }
}

@keyframes water-wave {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(2px) scale(1.02); }
}

@keyframes light-glow {
  0%, 100% { filter: drop-shadow(0 0 5px rgba(255,193,7,0.4)); }
  50% { filter: drop-shadow(0 0 12px rgba(255,193,7,0.7)); }
}
</style>