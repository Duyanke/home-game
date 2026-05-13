<template>
  <div
    class="beast-avatar"
    :class="[`beast-${normalizedType}`, `stage-${stage}`, `element-${element}`]"
    @click="handleClick"
  >
    <!-- 背景光环 -->
    <div class="aura-ring" :class="`aura-${element}`">
      <div class="aura-inner"></div>
      <div class="aura-particles"></div>
    </div>

    <!-- 神兽SVG主体 -->
    <svg viewBox="0 0 200 200" class="beast-svg" :class="{ 'hit-shake': isHit, 'click-bounce': isClicking }">
      <defs>
        <!-- 元素渐变 -->
        <linearGradient id="gradient-wood" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#81C784" />
          <stop offset="50%" style="stop-color:#4CAF50" />
          <stop offset="100%" style="stop-color:#388E3C" />
        </linearGradient>
        <linearGradient id="gradient-fire" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF8A65" />
          <stop offset="50%" style="stop-color:#FF5722" />
          <stop offset="100%" style="stop-color:#E64A19" />
        </linearGradient>
        <linearGradient id="gradient-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E0E0E0" />
          <stop offset="50%" style="stop-color:#BDBDBD" />
          <stop offset="100%" style="stop-color:#9E9E9E" />
        </linearGradient>
        <linearGradient id="gradient-water" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#64B5F6" />
          <stop offset="50%" style="stop-color:#2196F3" />
          <stop offset="100%" style="stop-color:#1976D2" />
        </linearGradient>
        <linearGradient id="gradient-light" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFE082" />
          <stop offset="50%" style="stop-color:#FFC107" />
          <stop offset="100%" style="stop-color:#FFA000" />
        </linearGradient>

        <!-- 眼睛渐变 -->
        <radialGradient id="eye-gradient">
          <stop offset="0%" style="stop-color:#FFFFFF" />
          <stop offset="70%" style="stop-color:#E0E0E0" />
          <stop offset="100%" style="stop-color:#9E9E9E" />
        </radialGradient>

        <!-- 神圣期发光滤镜 -->
        <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <!-- 进化期光晕滤镜 -->
        <filter id="evolution-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <!-- 金属光泽 -->
        <filter id="metal-shine">
          <feGaussianBlur stdDeviation="1" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <!-- 神兽主体 -->
      <g :filter="stage >= 4 ? 'url(#glow-filter)' : stage >= 3 ? 'url(#evolution-glow)' : ''">
        <!-- 身体 -->
        <path :d="bodyPath" class="beast-body" :fill="gradientId" />
        <!-- 装饰细节 -->
        <path :d="detailPath" class="beast-detail" fill="rgba(255,255,255,0.15)" />
        <!-- 特殊部位 -->
        <path v-if="hasHorns" :d="hornPath" class="beast-horn" :fill="gradientId" />
        <path v-if="hasWings" :d="wingPath" class="beast-wing" fill="rgba(255,255,255,0.3)" />
        <path v-if="hasShell" :d="shellPath" class="beast-shell" :fill="gradientId" />
      </g>

      <!-- 眼睛 -->
      <g class="beast-eyes">
        <circle :cx="eyePositions.left.x" :cy="eyePositions.left.y" r="8" fill="url(#eye-gradient)" class="eye-outer" />
        <circle :cx="eyePositions.left.x" :cy="eyePositions.left.y" r="4" :fill="eyeColor" class="eye-inner" />
        <circle :cx="eyePositions.right.x" :cy="eyePositions.right.y" r="8" fill="url(#eye-gradient)" class="eye-outer" />
        <circle :cx="eyePositions.right.x" :cy="eyePositions.right.y" r="4" :fill="eyeColor" class="eye-inner" />
      </g>

      <!-- 元素光环 -->
      <circle v-if="stage >= 3" class="element-glow" cx="100" cy="100" :r="glowRadius" />

      <!-- 神圣期特效 -->
      <g v-if="stage >= 4" class="divine-effect">
        <circle class="divine-ring divine-ring-1" cx="100" cy="100" r="90" />
        <circle class="divine-ring divine-ring-2" cx="100" cy="100" r="95" />
        <path class="divine-symbol" :d="divineSymbol" fill="rgba(255,255,255,0.2)" />
      </g>
    </svg>

    <!-- 点击粒子效果 -->
    <div v-if="showClickParticles" class="click-particles">
      <div class="particle" v-for="i in 8" :key="i" :style="{ '--delay': i * 0.05 + 's' }"></div>
    </div>

    <!-- 技能效果 -->
    <div v-if="activeSkill" class="skill-effect" :class="`effect-${activeSkill}`">
      <div class="effect-particles"></div>
      <div class="effect-flash"></div>
    </div>

    <!-- 阶段徽章 -->
    <div class="stage-badge" v-if="showStage">
      <span class="stage-text">{{ stageLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  beastType: string
  stage: number
  isHit?: boolean
  activeSkill?: string
  showStage?: boolean
}>()

// 点击状态
const isClicking = ref(false)
const showClickParticles = ref(false)

const handleClick = () => {
  isClicking.value = true
  showClickParticles.value = true
  setTimeout(() => {
    isClicking.value = false
  }, 300)
  setTimeout(() => {
    showClickParticles.value = false
  }, 800)
}

// 拼音转英文映射
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

const normalizedType = computed(() => nameMap[props.beastType] || props.beastType)
const element = computed(() => elementMap[normalizedType.value] || 'wood')
const gradientId = computed(() => `url(#gradient-${element.value})`)
const stageLabel = computed(() => stageNames[props.stage] || '幼年期')
const scale = computed(() => 1 + (props.stage - 1) * 0.1)
const glowRadius = computed(() => 60 + props.stage * 10)

// 眼睛颜色
const eyeColors: Record<string, string> = {
  wood: '#66BB6A',
  fire: '#FF5722',
  metal: '#BDBDBD',
  water: '#2196F3',
  light: '#FFC107'
}
const eyeColor = computed(() => eyeColors[element.value])

// 神兽特征开关
const hasHorns = computed(() => normalizedType.value === 'dragon' || normalizedType.value === 'kirin')
const hasWings = computed(() => normalizedType.value === 'phoenix')
const hasShell = computed(() => normalizedType.value === 'turtle')

// 眼睛位置配置
interface EyePosition { left: { x: number; y: number }; right: { x: number; y: number } }
type EyePositionsByStage = Record<number, EyePosition>

const eyePositionsMap: Record<string, EyePositionsByStage> = {
  dragon: {
    1: { left: { x: 75, y: 95 }, right: { x: 125, y: 95 } },
    2: { left: { x: 60, y: 75 }, right: { x: 140, y: 75 } },
    3: { left: { x: 50, y: 60 }, right: { x: 150, y: 60 } },
    4: { left: { x: 45, y: 55 }, right: { x: 155, y: 55 } }
  },
  phoenix: {
    1: { left: { x: 80, y: 80 }, right: { x: 120, y: 80 } },
    2: { left: { x: 65, y: 70 }, right: { x: 135, y: 70 } },
    3: { left: { x: 55, y: 55 }, right: { x: 145, y: 55 } },
    4: { left: { x: 50, y: 50 }, right: { x: 150, y: 50 } }
  },
  tiger: {
    1: { left: { x: 78, y: 90 }, right: { x: 122, y: 90 } },
    2: { left: { x: 65, y: 80 }, right: { x: 135, y: 80 } },
    3: { left: { x: 55, y: 70 }, right: { x: 145, y: 70 } },
    4: { left: { x: 50, y: 65 }, right: { x: 150, y: 65 } }
  },
  turtle: {
    1: { left: { x: 70, y: 100 }, right: { x: 130, y: 100 } },
    2: { left: { x: 60, y: 95 }, right: { x: 140, y: 95 } },
    3: { left: { x: 50, y: 90 }, right: { x: 150, y: 90 } },
    4: { left: { x: 45, y: 85 }, right: { x: 155, y: 85 } }
  },
  kirin: {
    1: { left: { x: 75, y: 70 }, right: { x: 125, y: 70 } },
    2: { left: { x: 60, y: 55 }, right: { x: 140, y: 55 } },
    3: { left: { x: 50, y: 45 }, right: { x: 150, y: 45 } },
    4: { left: { x: 45, y: 40 }, right: { x: 155, y: 40 } }
  }
}

const eyePositions = computed(() => {
  const typePositions = eyePositionsMap[normalizedType.value] || eyePositionsMap['dragon']
  return typePositions[props.stage] || typePositions[1]
})

// 神兽SVG路径定义（更精美的设计）
const beastPaths: Record<string, Record<number, { body: string; detail: string; horn?: string; wing?: string; shell?: string; divine?: string }>> = {
  dragon: {
    1: {
      body: 'M70,140 Q50,100 70,70 Q90,50 110,70 Q130,100 110,140 Q90,160 70,140 Z M70,140 Q55,155 60,165 Q65,175 75,170 Q80,165 70,140 M110,140 Q125,155 120,165 Q115,175 105,170 Q100,165 110,140',
      detail: 'M80,100 Q90,95 100,100 Q110,95 120,100 M70,80 Q75,75 80,80 M120,80 Q125,75 130,80'
    },
    2: {
      body: 'M50,150 Q30,100 50,60 Q70,30 100,50 Q130,30 150,60 Q170,100 150,150 Q120,180 80,180 Q50,180 50,150 Z M40,155 Q25,175 30,190 Q40,200 50,195 M160,155 Q175,175 170,190 Q160,200 150,195',
      detail: 'M60,90 Q80,85 100,90 Q120,85 140,90 M70,70 Q75,65 80,70 M130,70 Q135,65 140,70',
      horn: 'M55,55 L45,35 Q50,40 55,35 L55,55 M145,55 L155,35 Q150,40 145,35 L145,55'
    },
    3: {
      body: 'M30,160 Q10,100 30,50 Q50,20 100,40 Q150,20 170,50 Q190,100 170,160 Q140,200 60,200 Q30,200 30,160 Z M20,165 Q5,185 10,205 Q20,220 35,215 M180,165 Q195,185 190,205 Q180,220 165,215',
      detail: 'M50,80 Q75,75 100,80 Q125,75 150,80 M60,60 Q70,55 80,60 M140,60 Q150,55 160,60',
      horn: 'M45,45 L30,20 Q35,25 45,15 L55,30 L45,45 M155,45 L170,20 Q165,25 155,15 L145,30 L155,45'
    },
    4: {
      body: 'M20,170 Q0,100 20,40 Q40,10 100,30 Q160,10 180,40 Q200,100 180,170 Q150,210 50,210 Q20,210 20,170 Z M10,175 Q-5,195 0,220 Q15,235 30,230 M190,175 Q205,195 200,220 Q185,235 170,230',
      detail: 'M40,70 Q70,65 100,70 Q130,65 160,70 M50,50 Q60,45 70,50 M150,50 Q160,45 170,50',
      horn: 'M40,40 L20,10 Q25,15 40,5 L50,25 L40,40 M160,40 L180,10 Q175,15 160,5 L150,25 L160,40',
      divine: 'M100,30 L80,5 L100,15 L120,5 L100,30 M30,200 L10,220 M170,200 L190,220'
    }
  },
  phoenix: {
    1: {
      body: 'M100,50 L85,80 L70,100 L85,130 L100,160 L115,130 L130,100 L115,80 Z M85,50 Q75,40 80,30 M115,50 Q125,40 120,30',
      detail: 'M90,90 L100,100 L110,90 M100,110 Q95,115 100,120 Q105,115 100,110'
    },
    2: {
      body: 'M100,40 L75,80 L50,110 L70,140 L100,170 L130,140 L150,110 L125,80 Z M60,70 Q40,50 30,40 M140,70 Q160,50 170,40',
      detail: 'M85,85 L100,100 L115,85 M100,120 Q90,125 100,130 Q110,125 100,120',
      wing: 'M50,100 Q30,80 20,60 Q25,70 35,65 Q30,75 50,100 M150,100 Q170,80 180,60 Q175,70 165,65 Q170,75 150,100'
    },
    3: {
      body: 'M100,30 L65,70 L30,100 L55,140 L100,180 L145,140 L170,100 L135,70 Z M40,60 Q15,40 5,25 M160,60 Q185,40 195,25',
      detail: 'M80,70 L100,90 L120,70 M100,130 Q85,135 100,140 Q115,135 100,130',
      wing: 'M30,90 Q5,60 -5,40 Q5,55 15,50 Q0,70 30,90 M170,90 Q195,60 205,40 Q195,55 185,50 Q200,70 170,90'
    },
    4: {
      body: 'M100,25 L60,60 L20,90 L45,145 L100,190 L155,145 L180,90 L140,60 Z M35,50 Q5,30 -10,10 M165,50 Q195,30 210,10',
      detail: 'M75,60 L100,85 L125,60 M100,140 Q80,145 100,150 Q120,145 100,140',
      wing: 'M20,80 Q-10,50 -25,30 Q-5,45 5,40 Q-15,65 20,80 M180,80 Q210,50 225,30 Q205,45 195,40 Q215,65 180,80',
      divine: 'M100,25 L80,-5 L100,10 L120,-5 L100,25 M45,145 Q35,165 30,160 M155,145 Q165,165 170,160'
    }
  },
  tiger: {
    1: {
      body: 'M65,130 Q75,90 100,110 Q125,90 135,130 L140,165 Q100,185 60,165 Z M75,100 Q70,95 75,90 M125,100 Q130,95 125,90',
      detail: 'M85,120 Q100,125 115,120 M100,140 Q95,145 100,150 Q105,145 100,140'
    },
    2: {
      body: 'M45,130 Q60,70 100,95 Q140,70 155,130 L165,180 Q100,210 35,180 Z M55,85 Q40,70 35,55 M145,85 Q160,70 165,55',
      detail: 'M70,110 Q100,120 130,110 M100,155 Q90,160 100,165 Q110,160 100,155',
      horn: 'M60,80 L50,60 Q55,65 60,55 L60,80 M140,80 L150,60 Q145,65 140,55 L140,80'
    },
    3: {
      body: 'M30,125 Q45,55 100,85 Q155,55 170,125 L180,190 Q100,220 20,190 Z M35,70 Q20,50 15,35 M165,70 Q180,50 185,35',
      detail: 'M60,100 Q100,115 140,100 M100,170 Q85,175 100,180 Q115,175 100,170',
      horn: 'M50,70 L35,45 Q40,50 50,40 L55,60 L50,70 M150,70 L165,45 Q160,50 150,40 L145,60 L150,70'
    },
    4: {
      body: 'M20,120 Q35,40 100,75 Q165,40 180,120 L190,200 Q100,235 10,200 Z M25,65 Q10,45 5,30 M175,65 Q190,45 195,30',
      detail: 'M55,90 Q100,110 145,90 M100,180 Q80,185 100,190 Q120,185 100,180',
      horn: 'M45,65 L25,35 Q30,40 45,25 L50,55 L45,65 M155,65 L175,35 Q170,40 155,25 L150,55 L155,65',
      divine: 'M100,75 L85,50 L100,60 L115,50 L100,75 M20,200 L5,220 M180,200 L195,220'
    }
  },
  turtle: {
    1: {
      body: 'M60,120 A45,45 0 1,0 140,120 A45,45 0 1,0 60,120 M100,100 L100,75 Q90,65 100,60 Q110,65 100,75',
      detail: 'M80,110 Q100,105 120,110',
      shell: 'M70,110 A35,35 0 1,0 130,110 A35,35 0 1,0 70,110'
    },
    2: {
      body: 'M50,130 A55,55 0 1,0 150,130 A55,55 0 1,0 50,130 M100,110 L100,65 Q80,50 100,40 Q120,50 100,65 M70,95 Q50,105 45,120 M130,95 Q150,105 155,120',
      detail: 'M75,125 Q100,115 125,125',
      shell: 'M60,120 A45,45 0 1,0 140,120 A45,45 0 1,0 60,120'
    },
    3: {
      body: 'M40,140 A65,65 0 1,0 160,140 A65,65 0 1,0 40,140 M100,120 L100,55 Q70,35 100,25 Q130,35 100,55 M55,100 Q25,110 20,135 M145,100 Q175,110 180,135',
      detail: 'M70,140 Q100,125 130,140',
      shell: 'M50,130 A55,55 0 1,0 150,130 A55,55 0 1,0 50,130'
    },
    4: {
      body: 'M30,150 A75,75 0 1,0 170,150 A75,75 0 1,0 30,150 M100,130 L100,45 Q60,25 100,15 Q140,25 100,45 M45,105 Q15,115 10,140 M155,105 Q185,115 190,140',
      detail: 'M65,150 Q100,130 135,150',
      shell: 'M40,140 A65,65 0 1,0 160,140 A65,65 0 1,0 40,140',
      divine: 'M100,15 L80,-5 L100,5 L120,-5 L100,15 M10,140 L-5,160 M190,140 L205,160'
    }
  },
  kirin: {
    1: {
      body: 'M60,105 Q80,65 100,90 Q120,65 140,105 L150,160 Q100,180 50,160 Z M80,70 Q75,60 80,55 M120,70 Q125,60 120,55',
      detail: 'M85,110 Q100,115 115,110 M100,130 L95,120 L100,125 L105,120 L100,130'
    },
    2: {
      body: 'M40,100 Q65,45 100,75 Q135,45 160,100 L175,170 Q100,200 25,170 Z M55,50 Q40,35 35,20 M145,50 Q160,35 165,20',
      detail: 'M70,105 Q100,115 130,105 M100,145 L90,130 L100,135 L110,130 L100,145',
      horn: 'M60,50 L50,30 Q55,35 60,25 L65,45 L60,50 M140,50 L150,30 Q145,35 140,25 L135,45 L140,50'
    },
    3: {
      body: 'M25,95 Q50,35 100,65 Q150,35 175,95 L190,180 Q100,215 10,180 Z M40,40 Q20,20 15,5 M160,40 Q180,20 185,5',
      detail: 'M60,100 Q100,115 140,100 M100,160 L85,140 L100,150 L115,140 L100,160',
      horn: 'M50,40 L35,15 Q40,20 50,10 L55,35 L50,40 M150,40 L165,15 Q160,20 150,10 L145,35 L150,40'
    },
    4: {
      body: 'M15,90 Q40,25 100,55 Q160,25 185,90 L200,190 Q100,225 0,190 Z M30,35 Q10,15 5,0 M170,35 Q190,15 195,0',
      detail: 'M55,95 Q100,115 145,95 M100,175 L80,150 L100,160 L120,150 L100,175',
      horn: 'M45,35 L25,5 Q30,10 45,-5 L50,30 L45,35 M155,35 L175,5 Q170,10 155,-5 L150,30 L155,35',
      divine: 'M100,55 L85,30 L100,40 L115,30 L100,55 M0,190 L-15,210 M200,190 L215,210'
    }
  }
}

const bodyPath = computed(() => {
  const typePaths = beastPaths[normalizedType.value] || beastPaths['dragon']
  const stagePaths = typePaths[props.stage] || typePaths[1]
  return stagePaths.body
})

const detailPath = computed(() => {
  const typePaths = beastPaths[normalizedType.value] || beastPaths['dragon']
  const stagePaths = typePaths[props.stage] || typePaths[1]
  return stagePaths.detail || ''
})

const hornPath = computed(() => {
  const typePaths = beastPaths[normalizedType.value] || beastPaths['dragon']
  const stagePaths = typePaths[props.stage] || typePaths[1]
  return stagePaths.horn || ''
})

const wingPath = computed(() => {
  const typePaths = beastPaths[normalizedType.value] || beastPaths['dragon']
  const stagePaths = typePaths[props.stage] || typePaths[1]
  return stagePaths.wing || ''
})

const shellPath = computed(() => {
  const typePaths = beastPaths[normalizedType.value] || beastPaths['dragon']
  const stagePaths = typePaths[props.stage] || typePaths[1]
  return stagePaths.shell || ''
})

const divineSymbol = computed(() => {
  const typePaths = beastPaths[normalizedType.value] || beastPaths['dragon']
  const stagePaths = typePaths[props.stage] || typePaths[1]
  return stagePaths.divine || ''
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.beast-avatar {
  position: relative;
  width: 180px;
  height: 180px;
  @include flex-center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

// 背景光环
.aura-ring {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  opacity: 0.3;
  animation: aura-pulse 3s ease-in-out infinite;
}

.aura-inner {
  position: absolute;
  inset: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, currentColor 0%, transparent 70%);
  animation: aura-inner-pulse 2s ease-in-out infinite;
}

.aura-particles {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%);
}

.aura-wood { color: $color-element-wood; }
.aura-fire { color: $color-element-fire; animation-duration: 2s; }
.aura-metal { color: $color-element-metal; opacity: 0.2; }
.aura-water { color: $color-element-water; animation-duration: 4s; }
.aura-light { color: $color-element-light; animation-duration: 1.5s; }

// 神兽SVG
.beast-svg {
  width: 100%;
  height: 100%;
  transform: scale(v-bind('scale'));
  transition: transform 0.3s ease;
  position: relative;
  z-index: 2;

  &.hit-shake {
    animation: shake 0.5s ease-in-out;
  }

  &.click-bounce {
    animation: click-bounce 0.3s ease;
  }
}

// 身体样式
.beast-body {
  stroke: rgba(255,255,255,0.4);
  stroke-width: 2;
  transition: all 0.3s ease;
}

.beast-detail {
  opacity: 0.6;
}

.beast-horn {
  stroke: rgba(255,255,255,0.3);
  stroke-width: 1.5;
}

.beast-wing {
  animation: wing-flap 3s ease-in-out infinite;
  opacity: 0.7;
}

.beast-shell {
  stroke: rgba(255,255,255,0.2);
  stroke-width: 2;
  fill-opacity: 0.8;
}

// 眼睛样式
.beast-eyes {
  .eye-outer {
    animation: eye-blink 4s ease-in-out infinite;
  }
  .eye-inner {
    animation: eye-glow 2s ease-in-out infinite;
  }
}

// 元素光环
.element-glow {
  fill: none;
  stroke-width: 2;
  opacity: 0.4;
  animation: glow-ring 3s ease-in-out infinite;
}

.beast-dragon .element-glow { stroke: $color-element-wood; }
.beast-phoenix .element-glow { stroke: $color-element-fire; }
.beast-tiger .element-glow { stroke: $color-element-metal; }
.beast-turtle .element-glow { stroke: $color-element-water; }
.beast-kirin .element-glow { stroke: $color-element-light; }

// 神圣期特效
.divine-effect {
  .divine-ring {
    fill: none;
    stroke: rgba(255,255,255,0.3);
    stroke-width: 1;
    animation: divine-ring-rotate 8s linear infinite;
  }
  .divine-ring-2 {
    animation-direction: reverse;
    animation-duration: 6s;
  }
  .divine-symbol {
    opacity: 0.5;
    animation: divine-symbol-glow 2s ease-in-out infinite;
  }
}

// 点击粒子效果
.click-particles {
  position: absolute;
  inset: 0;
  z-index: 10;

  .particle {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $color-gold;
    left: 50%;
    top: 50%;
    animation: particle-burst 0.6s ease-out forwards;
    animation-delay: var(--delay);
    opacity: 0;

    &:nth-child(1) { --particle-x: -30px; --particle-y: -40px; }
    &:nth-child(2) { --particle-x: 30px; --particle-y: -40px; }
    &:nth-child(3) { --particle-x: -40px; --particle-y: 20px; }
    &:nth-child(4) { --particle-x: 40px; --particle-y: 20px; }
    &:nth-child(5) { --particle-x: 0px; --particle-y: -50px; }
    &:nth-child(6) { --particle-x: 0px; --particle-y: 50px; }
    &:nth-child(7) { --particle-x: -50px; --particle-y: 0px; }
    &:nth-child(8) { --particle-x: 50px; --particle-y: 0px; }
  }
}

// 元素特色动画
.element-wood .beast-svg {
  animation: breathe 2s ease-in-out infinite, wood-sway 4s ease-in-out infinite;
}

.element-fire .beast-svg {
  animation: breathe 1.5s ease-in-out infinite, fire-pulse 2s ease-in-out infinite;
}

.element-metal .beast-svg {
  animation: breathe 2.5s ease-in-out infinite, metal-shine 3s ease-in-out infinite;
}

.element-water .beast-svg {
  animation: breathe 3s ease-in-out infinite, water-wave 4s ease-in-out infinite;
}

.element-light .beast-svg {
  animation: breathe 1.5s ease-in-out infinite, light-glow 2s ease-in-out infinite;
}

// 技能效果
.skill-effect {
  position: absolute;
  inset: 0;
}

// 阶段徽章
.stage-badge {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, $color-dark-light, $color-dark-deep);
  padding: 6px 16px;
  border-radius: 16px;
  border: 1px solid rgba($color-gold, 0.3);
  z-index: 5;
}

.stage-text {
  color: $color-gold;
  font-size: 14px;
  font-weight: 600;
}

// ===== 动画定义 =====

@keyframes aura-pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.5; }
}

@keyframes aura-inner-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

@keyframes breathe {
  0%, 100% { transform: scale(v-bind('scale')); }
  50% { transform: scale(calc(v-bind('scale') * 1.05)); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-15px); }
  40% { transform: translateX(15px); }
  60% { transform: translateX(-8px); }
  80% { transform: translateX(8px); }
}

@keyframes click-bounce {
  0% { transform: scale(v-bind('scale')); }
  30% { transform: scale(calc(v-bind('scale') * 1.2)); }
  60% { transform: scale(calc(v-bind('scale') * 0.95)); }
  100% { transform: scale(v-bind('scale')); }
}

@keyframes glow-ring {
  0%, 100% { opacity: 0.3; stroke-width: 2; }
  50% { opacity: 0.6; stroke-width: 3; }
}

@keyframes wing-flap {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
  50% { transform: translateY(-5px) rotate(5deg); opacity: 0.9; }
}

@keyframes eye-blink {
  0%, 45%, 55%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.1); }
}

@keyframes eye-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes particle-burst {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0);
  }
  100% {
    opacity: 0;
    transform: translate(var(--particle-x, 30px), var(--particle-y, -30px)) scale(1);
  }
}

@keyframes wood-sway {
  0%, 100% { transform: rotate(0deg) scale(v-bind('scale')); }
  25% { transform: rotate(3deg) scale(calc(v-bind('scale') * 1.02)); }
  75% { transform: rotate(-3deg) scale(calc(v-bind('scale') * 1.02)); }
}

@keyframes fire-pulse {
  0%, 100% { filter: brightness(1); }
  30% { filter: brightness(1.3); }
  60% { filter: brightness(1.1); }
}

@keyframes metal-shine {
  0%, 100% { filter: brightness(1) contrast(1); }
  50% { filter: brightness(1.2) contrast(1.1); }
}

@keyframes water-wave {
  0%, 100% { transform: translateY(0) scale(v-bind('scale')); }
  50% { transform: translateY(3px) scale(calc(v-bind('scale') * 1.03)); }
}

@keyframes light-glow {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(255,193,7,0.5)); }
  50% { filter: drop-shadow(0 0 20px rgba(255,193,7,0.8)); }
}

@keyframes divine-ring-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes divine-symbol-glow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
</style>