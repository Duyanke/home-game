<template>
  <div class="battle-arena">
    <div class="arena-side opponent">
      <div class="side-header">
        <span class="side-name">{{ opponentName }}</span>
        <span class="side-beast">{{ opponentBeastLabel }}</span>
      </div>
      <BeastAvatar
        :beast-type="opponentBeastType"
        :stage="opponentStage"
        :is-hit="opponentIsHit"
      />
      <div class="hp-bar">
        <div class="bar-label">HP {{ opponentHp }}/{{ opponentMaxHp }}</div>
        <div class="bar-track">
          <div
            class="bar-fill hp"
            :style="{ width: `${(opponentHp / opponentMaxHp) * 100}%` }"
          ></div>
        </div>
      </div>
      <div class="ep-bar">
        <div class="bar-label">EP {{ opponentEp }}/100</div>
        <div class="bar-track">
          <div
            class="bar-fill ep"
            :style="{ width: `${opponentEp}%` }"
          ></div>
        </div>
      </div>
    </div>

    <div class="arena-divider">
      <span class="round-text">回合 {{ currentRound }}</span>
    </div>

    <div class="arena-side player">
      <div class="side-header">
        <span class="side-name">{{ playerName }}</span>
        <span class="side-beast">{{ playerBeastLabel }}</span>
      </div>
      <BeastAvatar
        :beast-type="playerBeastType"
        :stage="playerStage"
        :is-hit="playerIsHit"
      />
      <div class="hp-bar">
        <div class="bar-label">HP {{ playerHp }}/{{ playerMaxHp }}</div>
        <div class="bar-track">
          <div
            class="bar-fill hp"
            :style="{ width: `${(playerHp / playerMaxHp) * 100}%` }"
          ></div>
        </div>
      </div>
      <div class="ep-bar">
        <div class="bar-label">EP {{ playerEp }}/100</div>
        <div class="bar-track">
          <div
            class="bar-fill ep"
            :style="{ width: `${playerEp}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BeastAvatar from '@/components/common/BeastAvatar.vue'

const props = defineProps<{
  opponentName: string
  opponentBeastType: string
  opponentStage: number
  opponentHp: number
  opponentMaxHp: number
  opponentEp: number
  opponentIsHit: boolean
  playerName: string
  playerBeastType: string
  playerStage: number
  playerHp: number
  playerMaxHp: number
  playerEp: number
  playerIsHit: boolean
  currentRound: number
}>()

const beastNames: Record<string, string> = {
  dragon: '青龙',
  phoenix: '朱雀',
  tiger: '白虎',
  turtle: '玄武',
  kirin: '麒麟'
}

const opponentBeastLabel = computed(() => beastNames[props.opponentBeastType] || '')
const playerBeastLabel = computed(() => beastNames[props.playerBeastType] || '')
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.battle-arena {
  @include flex-column;
  gap: 24px;
  padding: 16px;
}

.arena-side {
  @include flex-column;
  align-items: center;
  gap: 16px;
}

.side-header {
  text-align: center;
}

.side-name {
  @include text-primary;
  font-size: 16px;
}

.side-beast {
  @include text-secondary;
  font-size: 12px;
}

.hp-bar, .ep-bar {
  width: 100%;
}

.bar-label {
  @include text-secondary;
  font-size: 12px;
  text-align: center;
  margin-bottom: 4px;
}

.bar-track {
  height: 12px;
  background: $color-dark-deep;
  border-radius: 6px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease;

  &.hp { background: $color-success; }
  &.ep { background: $color-warning; }
}

.arena-divider {
  @include flex-center;
  padding: 8px;
  background: $color-dark-light;
  border-radius: $button-radius;
}

.round-text {
  color: $color-gold;
  font-size: 14px;
  font-weight: 600;
}
</style>