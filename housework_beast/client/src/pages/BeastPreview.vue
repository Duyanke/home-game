<template>
  <div class="page-container preview-page">
    <BackHeader title="神兽预览" />
    <div class="page-content">
      <div class="preview-section" v-for="beast in beasts" :key="beast.type">
        <h2 class="beast-title">{{ beast.name }} - {{ beast.element }}</h2>
        <div class="stages-row">
          <div class="stage-item" v-for="stage in stages" :key="stage.level" @click="triggerClickAnimation(beast.type, stage.level)">
            <div class="stage-label">{{ stage.name }}</div>
            <BeastAvatar
              :ref="el => setRef(beast.type, stage.level, el)"
              :beast-type="beast.type"
              :stage="stage.level"
              :show-stage="true"
            />
            <div class="stage-stats">
              <div class="stat">HP: {{ beast.stats.hp + (stage.level - 1) * 10 }}</div>
              <div class="stat">ATK: {{ beast.stats.atk + (stage.level - 1) * 2 }}</div>
              <div class="stat">DEF: {{ beast.stats.def + (stage.level - 1) * 2 }}</div>
              <div class="stat">SPD: {{ beast.stats.spd + (stage.level - 1) * 1 }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="tips">
        <p>💡 点击神兽头像可以触发点击动画效果</p>
        <p>✨ 每种神兽都有独特的元素动画（呼吸、摇摆、发光等）</p>
      </div>
    </div>
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BackHeader from '@/components/common/BackHeader.vue'
import BeastAvatar from '@/components/common/BeastAvatar.vue'
import BottomNav from '@/components/common/BottomNav.vue'

const stages = [
  { level: 1, name: '幼年期' },
  { level: 2, name: '成年期' },
  { level: 3, name: '进化期' },
  { level: 4, name: '神圣期' }
]

const beasts = [
  { type: 'dragon', name: '青龙', element: '木', stats: { hp: 100, atk: 12, def: 8, spd: 10 } },
  { type: 'phoenix', name: '朱雀', element: '火', stats: { hp: 80, atk: 15, def: 5, spd: 12 } },
  { type: 'tiger', name: '白虎', element: '金', stats: { hp: 90, atk: 14, def: 7, spd: 11 } },
  { type: 'turtle', name: '玄武', element: '水', stats: { hp: 120, atk: 8, def: 12, spd: 6 } },
  { type: 'kirin', name: '麒麟', element: '光', stats: { hp: 85, atk: 13, def: 6, spd: 13 } }
]

// 存储ref引用
const avatarRefs = ref<Record<string, any>>({})

const setRef = (type: string, stage: number, el: any) => {
  if (el) {
    avatarRefs.value[`${type}-${stage}`] = el
  }
}

const triggerClickAnimation = (type: string, stage: number) => {
  const refKey = `${type}-${stage}`
  const avatar = avatarRefs.value[refKey]
  if (avatar && avatar.handleClick) {
    avatar.handleClick()
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.preview-page {
  background: $color-dark-base;
  min-height: 100vh;
}

.page-content {
  padding: 16px;
  padding-bottom: 80px;
}

.preview-section {
  margin-bottom: 32px;
  padding: 16px;
  background: $color-dark-light;
  border-radius: $card-radius;
}

.beast-title {
  color: $color-gold;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid $color-dark-deep;
}

.stages-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stage-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: $color-dark-deep;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba($color-gold, 0.2);
  }
}

.stage-label {
  color: $color-text-secondary;
  font-size: 12px;
  margin-bottom: 8px;
}

.stage-stats {
  margin-top: 8px;
  text-align: center;

  .stat {
    color: $color-text-secondary;
    font-size: 10px;
    line-height: 1.5;
  }
}

.tips {
  margin-top: 24px;
  padding: 16px;
  background: rgba($color-gold, 0.1);
  border-radius: 12px;
  border: 1px solid rgba($color-gold, 0.3);

  p {
    color: $color-text-secondary;
    font-size: 14px;
    margin: 8px 0;
  }
}

@media (max-width: 768px) {
  .stages-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>