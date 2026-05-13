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
import { useBattleStore } from '@/stores/battle'
import { sendMessage, getSocket, rejoinFamily, registerSocketCallback, removeSocketCallback } from '@/services/socket'

const route = useRoute()
const router = useRouter()
const familyStore = useFamilyStore()
const battleStore = useBattleStore()

const duelId = computed(() => route.params.duelId as string)
const playerName = computed(() => familyStore.memberName)
const opponentName = computed(() => battleStore.opponentName)

// 从 battleStore 读取状态
const playerBeast = computed(() => ({
  type: battleStore.myBeastType,
  stage: battleStore.myState?.stage || 1,
  stats: battleStore.myState ? {
    hp: battleStore.myState.maxHp,
    atk: battleStore.myState.atk,
    def: battleStore.myState.def,
    spd: battleStore.myState.spd
  } : { hp: 100, atk: 50, def: 50, spd: 50 },
  skills: battleStore.myState?.unlockedSkills || []
}))

const opponentBeast = computed(() => ({
  type: battleStore.opponentBeastType,
  stage: battleStore.opponentState?.stage || 1,
  stats: battleStore.opponentState ? {
    hp: battleStore.opponentState.maxHp
  } : { hp: 100 },
  skills: battleStore.opponentState?.unlockedSkills || []
}))

const playerHp = computed(() => battleStore.myState?.currentHp || 100)
const playerMaxHp = computed(() => battleStore.myState?.maxHp || 100)
const playerEp = computed(() => battleStore.myState?.currentEp || 0)
const opponentHp = computed(() => battleStore.opponentState?.currentHp || 100)
const opponentMaxHp = computed(() => battleStore.opponentState?.maxHp || 100)
const opponentEp = computed(() => battleStore.opponentState?.currentEp || 0)
const currentRound = computed(() => battleStore.currentRound || 1)

const playerIsHit = ref(false)
const opponentIsHit = ref(false)
const battleLogs = ref<Array<{ round: number; type: 'attack' | 'skill' | 'defend' | 'heal' | 'surrender'; action: string; damage?: number }>>([])
const showSkillEffect = ref(false)
const skillEffectData = ref({ type: 'attack' as 'attack' | 'skill' | 'defend' | 'heal' | 'surrender', name: '攻击' })

const battleEnded = computed(() => battleStore.battleEnded)
const isWinner = computed(() => battleStore.winnerId === familyStore.memberId)

const handleAction = (actionType: string) => {
  console.log('[BattlePage] handleAction:', actionType)
  sendMessage('DUEL_ACTION', {
    duelId: duelId.value,
    memberId: familyStore.memberId,
    action: actionType
  })
}

const handleSkill = (skillId: string) => {
  console.log('[BattlePage] handleSkill:', skillId)
  sendMessage('DUEL_ACTION', {
    duelId: duelId.value,
    memberId: familyStore.memberId,
    action: 'skill',
    skillId
  })
}

const goBack = () => {
  battleStore.clearDuel()
  router.push('/duel')
}

// 页面特定的 DUEL_ACTION_RESULT 回调 - 用于触发动画和日志

const onDuelActionResult = (data: { payload: { duelId: string; action: { actor: string; actionType: 'attack' | 'skill' | 'defend' | 'surrender'; damage?: number; targetHp?: number; skillId?: string }; actor: string } }) => {
  const result = data.payload.action
  const actorMemberId = data.payload.actor

  // 获取行动者名称
  const actorName = actorMemberId === familyStore.memberId ? familyStore.memberName :
    familyStore.members.find(m => m.id === actorMemberId)?.name || '对手'

  // 触发技能动画
  skillEffectData.value = {
    type: result.actionType,
    name: result.actionType === 'attack' ? '攻击' : result.actionType === 'defend' ? '防御' : result.skillId || '技能'
  }
  showSkillEffect.value = true

  // 触发受击动画
  if (result.actor === 'challenger') {
    if (result.damage) {
      opponentIsHit.value = true
      setTimeout(() => opponentIsHit.value = false, 500)
    }
  } else {
    if (result.damage) {
      playerIsHit.value = true
      setTimeout(() => playerIsHit.value = false, 500)
    }
  }

  // 添加战斗日志
  battleLogs.value.push({
    round: currentRound.value,
    type: result.actionType,
    action: actorName,
    damage: result.damage
  })
}

onMounted(() => {
  console.log('[BattlePage] onMounted, duelId:', duelId.value)
  console.log('[BattlePage] battleStore state:', {
    myState: battleStore.myState,
    opponentState: battleStore.opponentState,
    currentRound: battleStore.currentRound
  })

  // 确保 socket 映射正确
  const socket = getSocket()
  if (socket && socket.connected && familyStore.memberId && familyStore.familyId) {
    rejoinFamily(familyStore.memberId, familyStore.familyId)
  }

  // 注册页面特定的回调（动画和日志）
  registerSocketCallback('DUEL_ACTION_RESULT', onDuelActionResult)
})

onUnmounted(() => {
  removeSocketCallback('DUEL_ACTION_RESULT', onDuelActionResult)
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