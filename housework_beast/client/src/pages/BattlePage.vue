<template>
  <div class="page-container battle-page">
    <BackHeader :title="`决斗进行中 回合:${currentRound}`" />
    <div class="page-content">
      <BattleArena
        :opponent-name="opponentName"
        :opponent-beast-type="opponentBeast?.type || 'dragon'"
        :opponent-stage="opponentBeast?.stage || 1"
        :opponent-hp="opponentHp"
        :opponent-max-hp="opponentMaxHp"
        :opponent-ep="opponentEp"
        :opponent-is-hit="opponentIsHit"
        :player-name="playerName"
        :player-beast-type="playerBeast?.type || 'dragon'"
        :player-stage="playerBeast?.stage || 1"
        :player-hp="playerHp"
        :player-max-hp="playerMaxHp"
        :player-ep="playerEp"
        :player-is-hit="playerIsHit"
        :current-round="currentRound"
      />
      <BattleLog :logs="battleLogs" />
      <SkillButtons
        :ep="playerEp"
        :beast-type="playerBeast?.type || 'dragon'"
        :unlocked-skills="playerBeast?.skills || []"
        @action="handleAction"
        @skill="handleSkill"
      />
    </div>

    <SkillEffect
      :active="showSkillEffect"
      :skill-type="skillEffectData.type"
      :skill-name="skillEffectData.name"
      @complete="showSkillEffect = false"
    />

    <VictoryEffect
      :active="battleEnded"
      :is-victory="isWinner"
      @complete="goBack"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BackHeader from '@/components/common/BackHeader.vue'
import BattleArena from '@/components/duel/BattleArena.vue'
import BattleLog from '@/components/duel/BattleLog.vue'
import SkillButtons from '@/components/duel/SkillButtons.vue'
import SkillEffect from '@/components/effects/SkillEffect.vue'
import VictoryEffect from '@/components/effects/VictoryEffect.vue'
import { useFamilyStore } from '@/stores/family'
import { useBeastStore } from '@/stores/beast'
import { sendMessage, getSocket } from '@/services/socket'

const route = useRoute()
const router = useRouter()
const familyStore = useFamilyStore()
const beastStore = useBeastStore()

const duelId = computed(() => route.params.duelId as string)
const playerName = computed(() => familyStore.memberName)
const playerBeast = computed(() => beastStore.myBeast)
const playerMaxHp = computed(() => playerBeast.value?.stats.hp || 100)

const opponentName = ref('')
const opponentBeast = ref<{ type: string; stage: number; stats: { hp: number }; skills: string[] } | null>(null)
const opponentMaxHp = computed(() => opponentBeast.value?.stats.hp || 100)

const playerHp = ref(100)
const playerEp = ref(0)
const opponentHp = ref(100)
const opponentEp = ref(0)
const currentRound = ref(1)

const playerIsHit = ref(false)
const opponentIsHit = ref(false)
const battleLogs = ref<Array<{ round: number; type: 'attack' | 'skill' | 'defend' | 'heal'; action: string; damage?: number }>>([])
const battleEnded = ref(false)
const isWinner = ref(false)

const showSkillEffect = ref(false)
const skillEffectData = ref({ type: 'attack' as 'attack' | 'skill' | 'defend' | 'heal', name: '攻击' })

const handleAction = (actionType: string) => {
  sendMessage('DUEL_ACTION', { duelId: duelId.value, action: actionType })
}

const handleSkill = (skillId: string) => {
  sendMessage('DUEL_ACTION', { duelId: duelId.value, action: 'skill', skillId })
}

const goBack = () => {
  router.push('/duel')
}

onMounted(() => {
  const socket = getSocket()
  if (!socket) return

  socket.on('DUEL_STATE', (data) => {
    const state = data.payload
    playerHp.value = state.myHp
    playerEp.value = state.myEp
    opponentHp.value = state.opponentHp
    opponentEp.value = state.opponentEp
    currentRound.value = state.round
  })

  socket.on('DUEL_ACTION_RESULT', (data: { payload: { actor: string; targetDamage?: number; actionType: 'attack' | 'skill' | 'defend' | 'heal'; actorName: string; skillName?: string } }) => {
    const result = data.payload

    // 触发技能动画
    skillEffectData.value = {
      type: result.actionType,
      name: result.skillName || (result.actionType === 'attack' ? '攻击' : result.actionType === 'defend' ? '防御' : '技能')
    }
    showSkillEffect.value = true

    if (result.actor === familyStore.memberId) {
      if (result.targetDamage) {
        opponentIsHit.value = true
        setTimeout(() => opponentIsHit.value = false, 500)
      }
    } else {
      if (result.targetDamage) {
        playerIsHit.value = true
        setTimeout(() => playerIsHit.value = false, 500)
      }
    }

    battleLogs.value.push({
      round: currentRound.value,
      type: result.actionType,
      action: result.actorName,
      damage: result.targetDamage
    })
  })

  socket.on('ROUND_ENDED', (data) => {
    currentRound.value = data.payload.round
    playerEp.value = data.payload.myEp
    opponentEp.value = data.payload.opponentEp
  })

  socket.on('DUEL_ENDED', (data) => {
    battleEnded.value = true
    isWinner.value = data.payload.winnerId === familyStore.memberId
  })
})

onUnmounted(() => {
  const socket = getSocket()
  if (socket) {
    socket.off('DUEL_STATE')
    socket.off('DUEL_ACTION_RESULT')
    socket.off('ROUND_ENDED')
    socket.off('DUEL_ENDED')
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.battle-page {
  background: $color-dark-base;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba($color-dark-deep, 0.9);
  @include flex-center;
  z-index: 200;
}

.modal-content {
  @include card-base;
  text-align: center;
}

.result-title {
  font-size: 32px;
  font-weight: 700;

  &.win { color: $color-success; }
  &.lose { color: $color-error; }
}

.result-message {
  @include text-secondary;
  margin-top: 8px;
}

.back-btn {
  @include button-primary;
  width: 100%;
  margin-top: 24px;
}
</style>