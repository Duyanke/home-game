<template>
  <div
    class="beast-card"
    :class="[`beast-${beastType}`, { selected: isSelected }]"
    @click="$emit('select', beastType)"
  >
    <BeastAvatar
      :beast-type="beastType"
      :stage="1"
      :show-stage="false"
    />
    <div class="card-info">
      <h3 class="beast-name">{{ beastName }}</h3>
      <span class="beast-element">{{ elementLabel }}</span>
    </div>
    <div class="card-stats-preview" v-if="isSelected">
      <div class="stat-row">
        <span>HP</span>
        <span>{{ baseStats.hp }}</span>
      </div>
      <div class="stat-row">
        <span>ATK</span>
        <span>{{ baseStats.atk }}</span>
      </div>
      <div class="stat-row">
        <span>DEF</span>
        <span>{{ baseStats.def }}</span>
      </div>
      <div class="stat-row">
        <span>SPD</span>
        <span>{{ baseStats.spd }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BeastAvatar from './BeastAvatar.vue'

const props = defineProps<{
  beastType: string
  isSelected?: boolean
}>()

defineEmits<{
  select: [type: string]
}>()

const beastConfigs: Record<string, { name: string; element: string; baseStats: { hp: number; atk: number; def: number; spd: number } }> = {
  dragon: { name: '青龙', element: '木', baseStats: { hp: 100, atk: 12, def: 8, spd: 10 } },
  phoenix: { name: '朱雀', element: '火', baseStats: { hp: 80, atk: 15, def: 5, spd: 12 } },
  tiger: { name: '白虎', element: '金', baseStats: { hp: 90, atk: 14, def: 7, spd: 11 } },
  turtle: { name: '玄武', element: '水', baseStats: { hp: 120, atk: 8, def: 12, spd: 6 } },
  kirin: { name: '麒麟', element: '光', baseStats: { hp: 85, atk: 13, def: 6, spd: 13 } }
}

const elementLabels: Record<string, string> = {
  wood: '木',
  fire: '火',
  metal: '金',
  water: '水',
  light: '光'
}

const beastName = computed(() => beastConfigs[props.beastType]?.name ?? props.beastType)
const elementLabel = computed(() => elementLabels[beastConfigs[props.beastType]?.element] ?? beastConfigs[props.beastType]?.element ?? '')
const baseStats = computed(() => beastConfigs[props.beastType]?.baseStats ?? { hp: 0, atk: 0, def: 0, spd: 0 })
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.beast-card {
  @include card-base;
  width: 140px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 0 20px rgba($color-gold, 0.3);
  }

  &.selected {
    border-color: $color-gold;
    box-shadow: 0 0 20px rgba($color-gold, 0.3);
  }
}

.beast-dragon { background: linear-gradient(135deg, rgba($color-element-wood, 0.1), transparent); }
.beast-phoenix { background: linear-gradient(135deg, rgba($color-element-fire, 0.1), transparent); }
.beast-tiger { background: linear-gradient(135deg, rgba($color-element-metal, 0.1), transparent); }
.beast-turtle { background: linear-gradient(135deg, rgba($color-element-water, 0.1), transparent); }
.beast-kirin { background: linear-gradient(135deg, rgba($color-element-light, 0.1), transparent); }

.card-info {
  text-align: center;
  margin-top: 8px;
}

.beast-name {
  color: $color-text-primary;
  font-size: 16px;
  font-weight: 600;
}

.beast-element {
  color: $color-text-secondary;
  font-size: 12px;
}

.card-stats-preview {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid $color-dark-deep;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;

  span:first-child {
    color: $color-text-secondary;
    font-size: 12px;
  }

  span:last-child {
    color: $color-text-primary;
    font-size: 12px;
    font-weight: 600;
  }
}
</style>