<template>
  <div
    class="beast-card"
    :class="[`beast-${beastType}`, { selected: isSelected, clicking: isClicking }]"
    @click="handleClick"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <!-- 选择光效 -->
    <div class="card-glow" v-if="isSelected || isHovering"></div>

    <!-- 元素粒子背景 -->
    <div class="element-particles" :class="`particles-${element}`">
      <div class="particle" v-for="i in 6" :key="i"></div>
    </div>

    <!-- 神兽头像 -->
    <div class="avatar-wrapper" :class="{ hover: isHovering }">
      <BeastAvatar
        :beast-type="beastType"
        :stage="1"
        :show-stage="false"
      />
    </div>

    <!-- 卡片信息 -->
    <div class="card-info">
      <h3 class="beast-name">{{ beastName }}</h3>
      <span class="beast-element">{{ elementLabel }}</span>
    </div>

    <!-- 属性预览 -->
    <div class="card-stats-preview" v-if="isSelected">
      <div class="stat-row">
        <span class="stat-label">HP</span>
        <span class="stat-value">{{ baseStats.hp }}</span>
        <div class="stat-bar"><div class="stat-fill" :style="{ width: baseStats.hp / 150 * 100 + '%' }"></div></div>
      </div>
      <div class="stat-row">
        <span class="stat-label">ATK</span>
        <span class="stat-value">{{ baseStats.atk }}</span>
        <div class="stat-bar"><div class="stat-fill atk" :style="{ width: baseStats.atk / 20 * 100 + '%' }"></div></div>
      </div>
      <div class="stat-row">
        <span class="stat-label">DEF</span>
        <span class="stat-value">{{ baseStats.def }}</span>
        <div class="stat-bar"><div class="stat-fill def" :style="{ width: baseStats.def / 15 * 100 + '%' }"></div></div>
      </div>
      <div class="stat-row">
        <span class="stat-label">SPD</span>
        <span class="stat-value">{{ baseStats.spd }}</span>
        <div class="stat-bar"><div class="stat-fill spd" :style="{ width: baseStats.spd / 15 * 100 + '%' }"></div></div>
      </div>
    </div>

    <!-- 选择动画 -->
    <div class="select-animation" v-if="isSelected">
      <div class="select-ring"></div>
      <div class="select-ring delay"></div>
    </div>

    <!-- 点击波纹 -->
    <div class="click-ripple" v-if="showRipple">
      <div class="ripple"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BeastAvatar from './BeastAvatar.vue'

const props = defineProps<{
  beastType: string
  isSelected?: boolean
}>()

const emit = defineEmits<{
  select: [type: string]
}>()

const isHovering = ref(false)
const isClicking = ref(false)
const showRipple = ref(false)

const handleClick = () => {
  isClicking.value = true
  showRipple.value = true
  emit('select', props.beastType)
  setTimeout(() => {
    isClicking.value = false
  }, 300)
  setTimeout(() => {
    showRipple.value = false
  }, 600)
}

const beastConfigs: Record<string, { name: string; element: string; baseStats: { hp: number; atk: number; def: number; spd: number } }> = {
  dragon: { name: '青龙', element: 'wood', baseStats: { hp: 100, atk: 12, def: 8, spd: 10 } },
  phoenix: { name: '朱雀', element: 'fire', baseStats: { hp: 80, atk: 15, def: 5, spd: 12 } },
  tiger: { name: '白虎', element: 'metal', baseStats: { hp: 90, atk: 14, def: 7, spd: 11 } },
  turtle: { name: '玄武', element: 'water', baseStats: { hp: 120, atk: 8, def: 12, spd: 6 } },
  kirin: { name: '麒麟', element: 'light', baseStats: { hp: 85, atk: 13, def: 6, spd: 13 } }
}

const elementLabels: Record<string, string> = {
  wood: '木',
  fire: '火',
  metal: '金',
  water: '水',
  light: '光'
}

const beastName = computed(() => beastConfigs[props.beastType]?.name ?? props.beastType)
const element = computed(() => beastConfigs[props.beastType]?.element ?? 'wood')
const elementLabel = computed(() => elementLabels[element.value] ?? element.value)
const baseStats = computed(() => beastConfigs[props.beastType]?.baseStats ?? { hp: 0, atk: 0, def: 0, spd: 0 })
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.beast-card {
  @include card-base;
  width: 160px;
  min-height: 200px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: rgba($color-gold, 0.5);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3), 0 0 40px rgba($color-gold, 0.15);
  }

  &.selected {
    border-color: $color-gold;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 0 0 50px rgba($color-gold, 0.3);
    transform: translateY(-4px);
  }

  &.clicking {
    animation: card-click 0.3s ease;
  }
}

// 元素背景
.beast-dragon { background: linear-gradient(135deg, rgba($color-element-wood, 0.15), transparent), $color-dark-light; }
.beast-phoenix { background: linear-gradient(135deg, rgba($color-element-fire, 0.15), transparent), $color-dark-light; }
.beast-tiger { background: linear-gradient(135deg, rgba($color-element-metal, 0.15), transparent), $color-dark-light; }
.beast-turtle { background: linear-gradient(135deg, rgba($color-element-water, 0.15), transparent), $color-dark-light; }
.beast-kirin { background: linear-gradient(135deg, rgba($color-element-light, 0.15), transparent), $color-dark-light; }

// 卡片光效
.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba($color-gold, 0.1) 0%, transparent 70%);
  animation: glow-pulse 2s ease-in-out infinite;
  opacity: 0;
  transition: opacity 0.3s;
}

.beast-card:hover .card-glow,
.beast-card.selected .card-glow {
  opacity: 1;
}

// 元素粒子
.element-particles {
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0.3;

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: currentColor;
    animation: float-particle 3s ease-in-out infinite;
    opacity: 0;

    &:nth-child(1) { left: 20%; top: 30%; animation-delay: 0s; }
    &:nth-child(2) { left: 80%; top: 20%; animation-delay: 0.5s; }
    &:nth-child(3) { left: 30%; top: 70%; animation-delay: 1s; }
    &:nth-child(4) { left: 70%; top: 80%; animation-delay: 1.5s; }
    &:nth-child(5) { left: 50%; top: 10%; animation-delay: 2s; }
    &:nth-child(6) { left: 50%; top: 90%; animation-delay: 2.5s; }
  }
}

.beast-card:hover .element-particles .particle,
.beast-card.selected .element-particles .particle {
  opacity: 0.6;
}

.particles-wood { color: $color-element-wood; }
.particles-fire { color: $color-element-fire; animation-duration: 2s; }
.particles-metal { color: $color-element-metal; animation-duration: 4s; }
.particles-water { color: $color-element-water; animation-duration: 5s; }
.particles-light { color: $color-element-light; animation-duration: 1.5s; }

// 头像容器
.avatar-wrapper {
  @include flex-center;
  padding: 16px;
  transition: transform 0.3s ease;

  &.hover {
    transform: scale(1.1);
  }
}

// 卡片信息
.card-info {
  text-align: center;
  padding: 8px 0;
}

.beast-name {
  color: $color-text-primary;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
  letter-spacing: 2px;
}

.beast-element {
  color: $color-text-secondary;
  font-size: 13px;
  padding: 2px 8px;
  background: rgba($color-dark-deep, 0.5);
  border-radius: 4px;
}

// 属性预览
.card-stats-preview {
  margin-top: 12px;
  padding: 12px;
  background: rgba($color-dark-deep, 0.3);
  border-radius: 8px;
}

.stat-row {
  display: flex;
  align-items: center;
  padding: 4px 0;
  gap: 8px;
}

.stat-label {
  color: $color-text-secondary;
  font-size: 11px;
  width: 30px;
}

.stat-value {
  color: $color-text-primary;
  font-size: 12px;
  font-weight: 600;
  width: 25px;
}

.stat-bar {
  flex: 1;
  height: 6px;
  background: rgba($color-dark-deep, 0.5);
  border-radius: 3px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  border-radius: 3px;
  background: $color-success;
  transition: width 0.5s ease;

  &.atk { background: $color-red; }
  &.def { background: $color-info; }
  &.spd { background: $color-warning; }
}

// 选择动画
.select-animation {
  position: absolute;
  inset: 0;
  z-index: 0;

  .select-ring {
    position: absolute;
    inset: -10px;
    border: 2px solid rgba($color-gold, 0.3);
    border-radius: 16px;
    animation: select-ring-expand 1s ease-out forwards;
  }

  .select-ring.delay {
    animation-delay: 0.2s;
    border-color: rgba($color-gold, 0.1);
  }
}

// 点击波纹
.click-ripple {
  position: absolute;
  inset: 0;
  z-index: 10;
  @include flex-center;

  .ripple {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba($color-gold, 0.3);
    animation: ripple-expand 0.6s ease-out forwards;
  }
}

// ===== 动画定义 =====

@keyframes glow-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.5; }
}

@keyframes float-particle {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-10px) scale(1.5); opacity: 0.6; }
}

@keyframes card-click {
  0% { transform: scale(1); }
  30% { transform: scale(0.95); }
  60% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

@keyframes select-ring-expand {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.2); opacity: 0; }
}

@keyframes ripple-expand {
  0% { transform: scale(0); opacity: 0.5; }
  100% { transform: scale(3); opacity: 0; }
}
</style>