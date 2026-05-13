<template>
  <div class="skill-buttons">
    <button class="action-btn attack" @click="$emit('action', 'attack')">
      攻击
    </button>
    <button
      class="action-btn skill"
      :disabled="ep < skillCost"
      @click="showSkillMenu = true"
    >
      技能
    </button>
    <button class="action-btn defend" @click="$emit('action', 'defend')">
      防御
    </button>
    <button class="action-btn surrender" @click="$emit('action', 'surrender')">
      投降
    </button>

    <div class="skill-menu-overlay" v-if="showSkillMenu" @click.self="showSkillMenu = false">
      <div class="skill-menu">
        <button
          class="skill-option"
          v-for="skill in availableSkills"
          :key="skill.id"
          :disabled="ep < skill.cost"
          @click="useSkill(skill.id)"
        >
          <span class="skill-name">{{ skill.name }}</span>
          <span class="skill-cost">EP {{ skill.cost }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  ep: number
  beastType: string
  unlockedSkills: string[]
}>()

const emit = defineEmits<{
  action: [type: string]
  skill: [skillId: string]
}>()

const showSkillMenu = ref(false)
const skillCost = 20

const beastSkills: Record<string, string[]> = {
  dragon: ['风刃斩', '御风护盾', '龙吟', '天龙破'],
  phoenix: ['烈焰冲击', '火羽盾', '涅槃', '凤舞九天'],
  tiger: ['虎啸', '坚岩壁垒', '猛虎扑', '白虎杀'],
  turtle: ['玄武盾', '寒冰刺', '长寿', '玄武之力'],
  kirin: ['祥瑞之光', '祥瑞赐福', '圣光治愈', '麒麟降临']
}

const availableSkills = computed(() => {
  const skills = beastSkills[props.beastType] || beastSkills['dragon']
  return props.unlockedSkills.map(skillId => ({
    id: skillId,
    name: skillId,
    cost: skillCost
  }))
})

const useSkill = (skillId: string) => {
  showSkillMenu.value = false
  emit('skill', skillId)
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.skill-buttons {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: $color-dark-light;
}

.action-btn {
  @include button-base;
  flex: 1;
  padding: 12px;

  &.attack {
    background: $color-red;
    color: white;
  }
  &.skill {
    background: $color-warning;
    color: $color-dark-base;
  }
  &.defend {
    background: $color-info;
    color: white;
  }
  &.surrender {
    background: transparent;
    border: 1px solid $color-text-secondary;
    color: $color-text-secondary;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.skill-menu-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba($color-dark-deep, 0.8);
  padding: 16px;
}

.skill-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-option {
  @include card-base;
  display: flex;
  justify-content: space-between;

  &:disabled {
    opacity: 0.5;
  }
}
</style>