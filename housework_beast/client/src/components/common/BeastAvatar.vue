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

        <!-- 细节深色渐变（龙角、龙须等） -->
        <linearGradient id="detail-wood" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2E7D32" />
          <stop offset="100%" style="stop-color:#1B5E20" />
        </linearGradient>
        <linearGradient id="detail-fire" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E64A19" />
          <stop offset="100%" style="stop-color:#BF360C" />
        </linearGradient>
        <linearGradient id="detail-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#424242" />
          <stop offset="100%" style="stop-color:#212121" />
        </linearGradient>
        <linearGradient id="detail-water" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1565C0" />
          <stop offset="100%" style="stop-color:#0D47A1" />
        </linearGradient>
        <linearGradient id="detail-light" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFA000" />
          <stop offset="100%" style="stop-color:#FF6F00" />
        </linearGradient>

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

        <!-- 粒子渐变 -->
        <linearGradient id="particle-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#81C784" />
          <stop offset="100%" style="stop-color:#388E3C" />
        </linearGradient>
        <linearGradient id="particle-flame" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" style="stop-color:#FF5722" />
          <stop offset="50%" style="stop-color:#FFAB91" />
          <stop offset="100%" style="stop-color:#FFEB3B" />
        </linearGradient>
        <linearGradient id="particle-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFD700" />
          <stop offset="100%" style="stop-color:#FFA000" />
        </linearGradient>
        <linearGradient id="particle-water" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#64B5F6" />
          <stop offset="100%" style="stop-color:#1976D2" />
        </linearGradient>
        <linearGradient id="particle-light" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFFFFF" />
          <stop offset="50%" style="stop-color:#FFE082" />
          <stop offset="100%" style="stop-color:#FFC107" />
        </linearGradient>
      </defs>

      <!-- 神兽主体 -->
      <g :filter="stage >= 4 ? 'url(#glow-filter)' : stage >= 3 ? 'url(#evolution-glow)' : ''">
        <!-- 头部 -->
        <path :d="headPath" class="beast-head" :fill="gradientId" />
        <!-- 身体 -->
        <path :d="bodyPath" class="beast-body" :fill="gradientId" />
        <!-- 细节标识（王字纹/龙角/凤冠/龟甲纹理/鹿角） -->
        <path v-if="detailPath" :d="detailPath" class="beast-detail" :fill="detailGradientId" />
        <!-- 神圣期特效 -->
        <path v-if="divinePath" :d="divinePath" class="beast-divine" fill="rgba(255,215,0,0.4)" />
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
        <path class="divine-symbol" :d="divinePath" fill="rgba(255,255,255,0.2)" />
      </g>

      <!-- 元素粒子层 -->
      <g class="element-particles" :class="`particles-${element}`">
        <!-- 木元素 - 叶片环绕 -->
        <svg v-if="element === 'wood'" v-for="i in particleCount" :key="'leaf-' + i"
          class="particle-leaf" viewBox="0 0 10 16" :style="getParticleStyle(i, 'leaf')">
          <ellipse cx="5" cy="8" rx="4" ry="7" fill="url(#particle-leaf)"/>
          <path d="M5,1 Q3,5 5,8 Q7,5 5,1" fill="rgba(255,255,255,0.3)"/>
        </svg>

        <!-- 火元素 - 火焰飘动 -->
        <svg v-if="element === 'fire'" v-for="i in particleCount" :key="'flame-' + i"
          class="particle-flame" viewBox="0 0 12 20" :style="getParticleStyle(i, 'flame')">
          <path d="M6,20 Q0,15 3,10 Q1,5 6,0 Q11,5 9,10 Q12,15 6,20" fill="url(#particle-flame)"/>
        </svg>

        <!-- 金元素 - 光点飘落 -->
        <circle v-if="element === 'metal'" v-for="i in particleCount" :key="'sparkle-' + i"
          class="particle-sparkle" :style="getParticleStyle(i, 'sparkle')"/>

        <!-- 水元素 - 水滴流动 -->
        <svg v-if="element === 'water'" v-for="i in particleCount" :key="'drop-' + i"
          class="particle-drop" viewBox="0 0 10 14" :style="getParticleStyle(i, 'drop')">
          <path d="M5,0 Q0,8 5,14 Q10,8 5,0" fill="url(#particle-water)"/>
        </svg>

        <!-- 光元素 - 星芒闪耀 -->
        <svg v-if="element === 'light'" v-for="i in particleCount" :key="'star-' + i"
          class="particle-star" viewBox="0 0 20 20" :style="getParticleStyle(i, 'star')">
          <path d="M10,0 L12,8 L20,10 L12,12 L10,20 L8,12 L0,10 L8,8 Z" fill="url(#particle-light)"/>
        </svg>
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
const detailGradientId = computed(() => `url(#detail-${element.value})`)
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

// 粒子配置
const particleCountByStage: Record<number, number> = {
  1: 6,
  2: 8,
  3: 12,
  4: 16
}

const particleCount = computed(() => particleCountByStage[props.stage] || 6)

// 粒子样式生成函数
const getParticleStyle = (index: number, type: string): Record<string, string | number> => {
  const positions: Record<string, { x: number[]; y: number[] }> = {
    leaf: { x: [-30, -20, 0, 20, 30, -25, 15, -10], y: [-50, -30, -40, -35, -55, -25, -45, -60] },
    flame: { x: [-35, 35, -20, 20, 0, -30, 30, -15], y: [-55, -50, -40, -45, -60, -35, -30, -25] },
    sparkle: { x: [-40, -30, -15, 0, 15, 30, 40, -25, 25, -10, 10, -35, 35, -5, 5, -45], y: [-60, -45, -35, -55, -40, -50, -65, -30, -25, -70, -20, -55, -45, -60, -50, -40] },
    drop: { x: [-30, 30, -15, 15, 0, -25, 25, -10], y: [-45, -40, -55, -35, -50, -30, -25, -60] },
    star: { x: [-45, 45, -30, 30, 0, -25, 25, -15, 15, -40, 40, -20, 20, -10, 10, -35], y: [-65, -55, -45, -50, -70, -35, -40, -60, -30, -25, -45, -55, -35, -50, -40, -60] }
  }
  const pos = positions[type] || positions.leaf
  const x = pos.x[index % pos.x.length]
  const y = pos.y[index % pos.y.length]
  const delay = index * 0.15
  const scaleVal = 0.6 + (index % 4) * 0.1

  return {
    left: `${100 + x}px`,
    top: `${100 + y}px`,
    width: type === 'sparkle' ? '6px' : '12px',
    height: type === 'sparkle' ? '6px' : '12px',
    animationDelay: `${delay}s`,
    transform: `scale(${scaleVal})`,
    opacity: '0.8'
  }
}

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
    1: { left: { x: 58, y: 52 }, right: { x: 78, y: 55 } },
    2: { left: { x: 45, y: 42 }, right: { x: 75, y: 48 } },
    3: { left: { x: 35, y: 35 }, right: { x: 70, y: 42 } },
    4: { left: { x: 28, y: 28 }, right: { x: 65, y: 38 } }
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

// 神兽SVG路径定义（简化版 - 后续可迭代优化）
interface BeastPathData {
  body: string      // 主体轮廓
  head?: string     // 头部
  detail?: string   // 细节标识
  divine?: string   // 神圣期特效
}

const beastPaths: Record<string, Record<number, BeastPathData>> = {
  // ===== 白虎 - 简化抽象形态 =====
  tiger: {
    1: {
      body: 'M70,100 A35,30 0 1,1 130,100 A35,30 0 1,1 70,100',
      head: 'M65,85 A20,18 0 1,1 95,85 A20,18 0 1,1 65,85',
      detail: 'M75,80 Q85,75 95,80 M80,85 L90,85 M75,90 Q85,95 95,90', // 王字纹
    },
    2: {
      body: 'M55,100 A50,45 0 1,1 145,100 A50,45 0 1,1 55,100',
      head: 'M50,80 A30,28 0 1,1 90,80 A30,28 0 1,1 50,80',
      detail: 'M60,72 Q75,68 90,72 M65,78 L85,78 M60,85 Q75,90 90,85', // 王字纹
    },
    3: {
      body: 'M40,100 A65,60 0 1,1 160,100 A65,60 0 1,1 40,100',
      head: 'M35,70 A40,38 0 1,1 85,70 A40,38 0 1,1 35,70',
      detail: 'M45,60 Q65,55 85,60 M50,68 L80,68 M45,78 Q65,85 85,78', // 王字纹
    },
    4: {
      body: 'M25,100 A80,75 0 1,1 175,100 A80,75 0 1,1 25,100',
      head: 'M20,60 A50,48 0 1,1 80,60 A50,48 0 1,1 20,60',
      detail: 'M30,45 Q55,40 80,45 M35,55 L75,55 M30,68 Q55,75 80,68', // 王字纹
      divine: 'M100,25 L80,5 L100,15 L120,5 L100,25', // 神圣光环
    }
  },
  // ===== 青龙 - 简化抽象形态 =====
  dragon: {
    1: {
      body: 'M70,100 A35,30 0 1,1 130,100 A35,30 0 1,1 70,100',
      head: 'M60,85 A18,20 0 1,1 78,85 A18,20 0 1,1 60,85',
      detail: 'M65,82 L60,70 M75,82 L80,70', // 龙角
    },
    2: {
      body: 'M55,100 A50,45 0 1,1 145,100 A50,45 0 1,1 55,100',
      head: 'M45,80 A28,30 0 1,1 73,80 A28,30 0 1,1 45,80',
      detail: 'M50,75 L42,60 M68,75 L76,60 M55,90 Q60,85 65,90', // 龙角+龙须
    },
    3: {
      body: 'M40,100 A65,60 0 1,1 160,100 A65,60 0 1,1 40,100',
      head: 'M30,70 A38,40 0 1,1 68,70 A38,40 0 1,1 30,70',
      detail: 'M35,65 L25,50 M63,65 L73,50 M45,85 Q55,80 65,85', // 龙角+龙须
    },
    4: {
      body: 'M25,100 A80,75 0 1,1 175,100 A80,75 0 1,1 25,100',
      head: 'M15,60 A48,50 0 1,1 63,60 A48,50 0 1,1 15,60',
      detail: 'M20,55 L8,40 M58,55 L70,40 M30,80 Q45,75 60,80', // 龙角+龙须
      divine: 'M100,25 L80,5 L100,15 L120,5 L100,25',
    }
  },
  // ===== 朱雀 - 简化抽象形态 =====
  phoenix: {
    1: {
      body: 'M70,100 A35,30 0 1,1 130,100 A35,30 0 1,1 70,100',
      head: 'M65,85 A15,18 0 1,1 95,85 A15,18 0 1,1 65,85',
      detail: 'M75,80 L70,68 M85,80 L90,68', // 凤冠
    },
    2: {
      body: 'M55,100 A50,45 0 1,1 145,100 A50,45 0 1,1 55,100',
      head: 'M50,80 A22,25 0 1,1 94,80 A22,25 0 1,1 50,80',
      detail: 'M62,72 L55,58 M78,72 L85,58', // 凤冠
    },
    3: {
      body: 'M40,100 A65,60 0 1,1 160,100 A65,60 0 1,1 40,100',
      head: 'M35,70 A30,33 0 1,1 95,70 A30,33 0 1,1 35,70',
      detail: 'M50,62 L40,45 M80,62 L90,45', // 凤冠
    },
    4: {
      body: 'M25,100 A80,75 0 1,1 175,100 A80,75 0 1,1 25,100',
      head: 'M20,60 A38,40 0 1,1 96,60 A38,40 0 1,1 20,60',
      detail: 'M35,50 L22,32 M81,50 L94,32', // 凤冠
      divine: 'M100,25 L80,5 L100,15 L120,5 L100,25',
    }
  },
  // ===== 玄武 - 简化抽象形态 =====
  turtle: {
    1: {
      body: 'M60,95 A45,40 0 1,1 140,95 A45,40 0 1,1 60,95', // 龟甲
      head: 'M100,85 A12,12 0 1,1 112,85 A12,12 0 1,1 100,85',
      detail: 'M80,90 L100,90 L120,90 M80,90 L80,100 M100,90 L100,100 M120,90 L120,100', // 龟甲纹理
    },
    2: {
      body: 'M50,90 A55,50 0 1,1 150,90 A55,50 0 1,1 50,90',
      head: 'M100,75 A18,18 0 1,1 118,75 A18,18 0 1,1 100,75',
      detail: 'M70,85 L90,75 L100,85 L110,75 L130,85', // 龟甲纹理
    },
    3: {
      body: 'M35,85 A70,65 0 1,1 165,85 A70,65 0 1,1 35,85',
      head: 'M100,65 A25,25 0 1,1 125,65 A25,25 0 1,1 100,65',
      detail: 'M55,80 L75,70 L95,80 L105,70 L125,80 L145,70', // 龟甲纹理
    },
    4: {
      body: 'M20,80 A85,80 0 1,1 180,80 A85,80 0 1,1 20,80',
      head: 'M100,50 A35,35 0 1,1 135,50 A35,35 0 1,1 100,50',
      detail: 'M40,75 L60,65 L80,75 L100,65 L120,75 L140,65 L160,75', // 龟甲纹理
      divine: 'M100,25 L80,5 L100,15 L120,5 L100,25',
    }
  },
  // ===== 麒麟 - 简化抽象形态 =====
  kirin: {
    1: {
      body: 'M70,100 A35,30 0 1,1 130,100 A35,30 0 1,1 70,100',
      head: 'M65,85 A20,18 0 1,1 105,85 A20,18 0 1,1 65,85',
      detail: 'M75,80 L68,65 M95,80 L102,65', // 鹿角
    },
    2: {
      body: 'M55,100 A50,45 0 1,1 145,100 A50,45 0 1,1 55,100',
      head: 'M50,80 A30,28 0 1,1 110,80 A30,28 0 1,1 50,80',
      detail: 'M60,72 L50,55 L60,62 M100,72 L110,55 L100,62', // 鹿角分叉
    },
    3: {
      body: 'M40,100 A65,60 0 1,1 160,100 A65,60 0 1,1 40,100',
      head: 'M35,70 A40,38 0 1,1 115,70 A40,38 0 1,1 35,70',
      detail: 'M45,62 L32,45 L45,52 M105,62 L118,45 L105,52', // 鹿角分叉
    },
    4: {
      body: 'M25,100 A80,75 0 1,1 175,100 A80,75 0 1,1 25,100',
      head: 'M20,60 A50,48 0 1,1 120,60 A50,48 0 1,1 20,60',
      detail: 'M30,50 L15,32 L30,40 M110,50 L125,32 L110,40', // 鹿角分叉
      divine: 'M100,25 L80,5 L100,15 L120,5 L100,25',
    }
  }
}
const bodyPath = computed(() => {
  const typePaths = beastPaths[normalizedType.value] || beastPaths['tiger']
  const stagePaths = typePaths[props.stage] || typePaths[1]
  return stagePaths.body || ''
})

const detailPath = computed(() => {
  const typePaths = beastPaths[normalizedType.value] || beastPaths['tiger']
  const stagePaths = typePaths[props.stage] || typePaths[1]
  return stagePaths.detail || ''
})

// ===== 简化版神兽路径 =====

// 头部路径
const headPath = computed(() => {
  const typePaths = beastPaths[normalizedType.value] || beastPaths['tiger']
  const stagePaths = typePaths[props.stage] || typePaths[1]
  return stagePaths.head || ''
})

// 神圣特效路径
const divinePath = computed(() => {
  const typePaths = beastPaths[normalizedType.value] || beastPaths['tiger']
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

// 头部样式
.beast-head {
  stroke: rgba(255,255,255,0.3);
  stroke-width: 2;
  transition: all 0.3s ease;
}

// 耳朵样式
.beast-ears {
  stroke: rgba(255,255,255,0.2);
  stroke-width: 1.5;
}

// 嘴部样式
.beast-muzzle {
  stroke: rgba(255,255,255,0.2);
  stroke-width: 1.5;
}

// 身体样式
.beast-body {
  stroke: rgba(255,255,255,0.4);
  stroke-width: 2;
  transition: all 0.3s ease;
}

// 纹理/条纹样式
.beast-stripes {
  opacity: 0.7;
}

// 前腿样式
.beast-front-legs {
  stroke: rgba(255,255,255,0.3);
  stroke-width: 1.5;
}

// 后腿样式
.beast-back-legs {
  stroke: rgba(255,255,255,0.3);
  stroke-width: 1.5;
}

// 尾巴样式
.beast-tail {
  stroke: rgba(255,255,255,0.2);
  stroke-width: 1.5;
  opacity: 0.9;
}

// 翅膀样式
.beast-wings {
  animation: wing-flap 3s ease-in-out infinite;
  opacity: 0.8;
}

// 龟甲样式
.beast-shell {
  stroke: rgba(255,255,255,0.2);
  stroke-width: 2;
  fill-opacity: 0.8;
}

// 蛇身样式
.beast-snake {
  stroke: rgba(255,255,255,0.2);
  stroke-width: 1.5;
  opacity: 0.9;
}

// 神圣特效样式
.beast-divine {
  opacity: 0.6;
  animation: divine-symbol-glow 2s ease-in-out infinite;
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

// 龙须样式
.beast-whisker {
  stroke-linecap: round;
  opacity: 0.8;
}

// 龙鳞样式
.beast-scales {
  stroke: rgba(255,255,255,0.1);
  stroke-width: 1;
  opacity: 0.6;
}

// 龙爪/四肢样式
.beast-legs {
  stroke: rgba(255,255,255,0.3);
  stroke-width: 1.5;
}

// 尾巴样式
.beast-tail {
  stroke: rgba(255,255,255,0.2);
  stroke-width: 1.5;
  opacity: 0.9;
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

// ===== 元素粒子动画 =====

.element-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

// 木元素 - 叶片飘落
.particle-leaf {
  animation: leaf-float 3s ease-in-out infinite;
}

@keyframes leaf-float {
  0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.8; }
  50% { transform: translateY(10px) translateX(15px) rotate(45deg); opacity: 0.6; }
  90% { opacity: 0.4; }
  100% { transform: translateY(30px) translateX(-10px) rotate(90deg); opacity: 0; }
}

// 火元素 - 火焰闪烁
.particle-flame {
  animation: flame-flicker 2s ease-in-out infinite, flame-color 1.5s ease-in-out infinite;
}

@keyframes flame-flicker {
  0% { transform: translateY(0) scaleY(1); opacity: 0.8; }
  25% { transform: translateY(-5px) scaleY(1.1); opacity: 1; }
  50% { transform: translateY(-8px) scaleY(0.9); opacity: 0.7; }
  75% { transform: translateY(-3px) scaleY(1.05); opacity: 0.9; }
  100% { transform: translateY(-10px) scaleY(0.8); opacity: 0; }
}

@keyframes flame-color {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(15deg) brightness(1.2); }
}

// 金元素 - 光点闪烁
.particle-sparkle {
  background: linear-gradient(135deg, #FFD700, #FFA000);
  border-radius: 50%;
  animation: gold-sparkle 2.5s ease-in-out infinite, sparkle-flash 1s ease-in-out infinite;
}

@keyframes gold-sparkle {
  0% { transform: translateY(-30px) scale(0.5); opacity: 0; }
  20% { opacity: 1; transform: translateY(-10px) scale(1); }
  50% { opacity: 0.6; }
  70% { opacity: 1; }
  100% { transform: translateY(20px) scale(0.3); opacity: 0; }
}

@keyframes sparkle-flash {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.5); }
}

// 水元素 - 水滴流动
.particle-drop {
  animation: water-drop 3.5s ease-in-out infinite, water-ripple 2s ease-in-out infinite;
}

@keyframes water-drop {
  0% { transform: translateY(-15px) translateX(0); opacity: 0; }
  20% { opacity: 0.7; }
  50% { transform: translateY(10px) translateX(10px); opacity: 0.6; }
  80% { transform: translateY(25px) translateX(-5px); opacity: 0.5; }
  100% { transform: translateY(40px) translateX(0); opacity: 0; }
}

@keyframes water-ripple {
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(1.2); }
}

// 光元素 - 星芒闪耀
.particle-star {
  animation: light-star 2s ease-in-out infinite, light-glow-particle 1.5s ease-in-out infinite;
}

@keyframes light-star {
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  20% { transform: scale(1) rotate(45deg); opacity: 1; }
  50% { transform: scale(0.8) rotate(90deg); opacity: 0.8; }
  80% { transform: scale(1.2) rotate(135deg); opacity: 0.6; }
  100% { transform: scale(0) rotate(180deg); opacity: 0; }
}

@keyframes light-glow-particle {
  0%, 100% { filter: drop-shadow(0 0 3px rgba(255,215,0,0.5)); }
  50% { filter: drop-shadow(0 0 8px rgba(255,215,0,0.8)); }
}
</style>