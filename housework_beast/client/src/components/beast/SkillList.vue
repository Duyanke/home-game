<template>
  <div class="skill-list">
    <h4 class="list-title">技能列表</h4>
    <div class="skill-item" v-for="skill in skills" :key="skill.id" :class="{ locked: skill.locked }">
      <span class="skill-name">{{ skill.name }}</span>
      <span class="skill-element">{{ skill.element }}</span>
      <span class="skill-cost" v-if="!skill.locked">EP {{ skill.cost }}</span>
      <span class="skill-locked-label" v-else>未解锁</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  beastType: string
  currentStage: number
  unlockedSkills: string[]
}>()

const elementLabels: Record<string, string> = {
  wood: '木',
  fire: '火',
  metal: '金',
  water: '水',
  light: '光'
}

const beastElements: Record<string, string> = {
  dragon: 'wood',
  phoenix: 'fire',
  tiger: 'metal',
  turtle: 'water',
  kirin: 'light'
}

const beastSkills: Record<string, string[]> = {
  dragon: ['风刃斩', '御风护盾', '龙吟', '天龙破'],
  phoenix: ['烈焰冲击', '火羽盾', '涅槃', '凤舞九天'],
  tiger: ['虎啸', '坚岩壁垒', '猛虎扑', '白虎杀'],
  turtle: ['玄武盾', '寒冰刺', '长寿', '玄武之力'],
  kirin: ['祥瑞之光', '祥瑞赐福', '圣光治愈', '麒麟降临']
}

const skillData: Record<string, { id: string; name: string; unlockStage: number }> = {
  '风刃斩': { id: 'wind_slash', name: '风刃斩', unlockStage: 1 },
  '御风护盾': { id: 'wind_shield', name: '御风护盾', unlockStage: 2 },
  '龙吟': { id: 'dragon_roar', name: '龙吟', unlockStage: 3 },
  '天龙破': { id: 'dragon_breath', name: '天龙破', unlockStage: 4 },
  '烈焰冲击': { id: 'flame_strike', name: '烈焰冲击', unlockStage: 1 },
  '火羽盾': { id: 'fire_shield', name: '火羽盾', unlockStage: 2 },
  '涅槃': { id: 'rebirth', name: '涅槃', unlockStage: 3 },
  '凤舞九天': { id: 'sky_flame', name: '凤舞九天', unlockStage: 4 },
  '虎啸': { id: 'frost_bite', name: '虎啸', unlockStage: 1 },
  '坚岩壁垒': { id: 'tiger_roar', name: '坚岩壁垒', unlockStage: 2 },
  '猛虎扑': { id: 'iron_body', name: '猛虎扑', unlockStage: 3 },
  '白虎杀': { id: 'tiger_kill', name: '白虎杀', unlockStage: 4 },
  '玄武盾': { id: 'rock_wall', name: '玄武盾', unlockStage: 1 },
  '寒冰刺': { id: 'ice_shield', name: '寒冰刺', unlockStage: 2 },
  '长寿': { id: 'xuanwu_power', name: '长寿', unlockStage: 3 },
  '玄武之力': { id: 'xuanwu_force', name: '玄武之力', unlockStage: 4 },
  '祥瑞之光': { id: 'bless_light', name: '祥瑞之光', unlockStage: 1 },
  '祥瑞赐福': { id: 'holy_heal', name: '祥瑞赐福', unlockStage: 2 },
  '圣光治愈': { id: 'blessing', name: '圣光治愈', unlockStage: 3 },
  '麒麟降临': { id: 'kirin_descend', name: '麒麟降临', unlockStage: 4 }
}

const skills = computed(() => {
  const element = beastElements[props.beastType] || 'wood'
  const skillNames = beastSkills[props.beastType] || beastSkills['dragon']

  return skillNames.map(skillName => {
    const skillInfo = skillData[skillName] || { id: skillName, name: skillName, unlockStage: 1 }
    const isLocked = props.currentStage < skillInfo.unlockStage || !props.unlockedSkills.includes(skillInfo.id)
    return {
      id: skillInfo.id,
      name: skillName,
      element: elementLabels[element] || '木',
      cost: 20,
      locked: isLocked
    }
  })
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.skill-list {
  @include card-base;
  margin-top: 24px;
}

.list-title {
  @include text-primary;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.skill-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: $color-dark-deep;
  border-radius: $button-radius;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  &.locked {
    opacity: 0.5;
  }
}

.skill-name {
  @include text-primary;
  font-size: 14px;
  flex: 1;
}

.skill-element {
  @include text-secondary;
  font-size: 12px;
  padding: 2px 8px;
  background: $color-dark-light;
  border-radius: 4px;
  margin-right: 8px;
}

.skill-cost {
  color: $color-warning;
  font-size: 12px;
}

.skill-locked-label {
  color: $color-text-secondary;
  font-size: 12px;
}
</style>