// stores/battle.ts - 战斗状态管理
import { defineStore } from 'pinia'
import { useFamilyStore } from './family'

// 神兽类型映射：后端中文拼音 -> 前端英文
const typeMap: Record<string, string> = {
  qinglong: 'dragon',
  zhuque: 'phoenix',
  baihu: 'tiger',
  xuanwu: 'turtle',
  qilin: 'kirin'
}

export interface BattleState {
  beastId: string
  memberId: string
  beastType: string
  stage: number
  currentHp: number
  maxHp: number
  atk: number
  def: number
  spd: number
  currentEp: number
  maxEp: number
  defenseBoost: number
  damageReduce: number
  immune: boolean
  counter: number
  statsBoost: number
  statsBoostTurns: number
  powerBonus: number
  unlockedSkills: string[]
  isDefending: boolean
  hasRevive: boolean
}

export interface DuelState {
  duelId: string
  challengerId: string
  defenderId: string
  challengerState: BattleState | null
  defenderState: BattleState | null
  firstActor: 'challenger' | 'defender'
  currentRound: number
  waitingFor: 'challenger' | 'defender'
  battleEnded: boolean
  winnerId: string | null
}

export const useBattleStore = defineStore('battle', {
  state: (): DuelState => ({
    duelId: '',
    challengerId: '',
    defenderId: '',
    challengerState: null,
    defenderState: null,
    firstActor: 'challenger',
    currentRound: 1,
    waitingFor: 'challenger',
    battleEnded: false,
    winnerId: null
  }),

  getters: {
    isChallenger(): boolean {
      const familyStore = useFamilyStore()
      return familyStore.memberId === this.challengerId
    },

    myState(): BattleState | null {
      return this.isChallenger ? this.challengerState : this.defenderState
    },

    opponentState(): BattleState | null {
      return this.isChallenger ? this.defenderState : this.challengerState
    },

    myBeastType(): string {
      if (!this.myState) return 'dragon'
      return typeMap[this.myState.beastType] || this.myState.beastType
    },

    opponentBeastType(): string {
      if (!this.opponentState) return 'dragon'
      return typeMap[this.opponentState.beastType] || this.opponentState.beastType
    },

    opponentName(): string {
      const familyStore = useFamilyStore()
      if (this.isChallenger) {
        return familyStore.members.find(m => m.id === this.defenderId)?.name || '对手'
      }
      return familyStore.members.find(m => m.id === this.challengerId)?.name || '对手'
    },

    isMyTurn(): boolean {
      return this.waitingFor === (this.isChallenger ? 'challenger' : 'defender')
    }
  },

  actions: {
    initDuel(data: {
      duelId: string
      challengerId: string
      defenderId: string
      challengerState: BattleState
      defenderState: BattleState
      firstActor: string
      currentRound: number
      waitingFor: string
    }) {
      this.duelId = data.duelId
      this.challengerId = data.challengerId
      this.defenderId = data.defenderId
      this.challengerState = data.challengerState
      this.defenderState = data.defenderState
      this.firstActor = data.firstActor as 'challenger' | 'defender'
      this.currentRound = data.currentRound
      this.waitingFor = data.waitingFor as 'challenger' | 'defender'
      this.battleEnded = false
      this.winnerId = null
    },

    updateHp(actor: 'challenger' | 'defender', newHp: number) {
      if (actor === 'challenger' && this.challengerState) {
        this.challengerState.currentHp = newHp
      } else if (actor === 'defender' && this.defenderState) {
        this.defenderState.currentHp = newHp
      }
    },

    updateEp(actor: 'challenger' | 'defender', newEp: number) {
      if (actor === 'challenger' && this.challengerState) {
        this.challengerState.currentEp = newEp
      } else if (actor === 'defender' && this.defenderState) {
        this.defenderState.currentEp = newEp
      }
    },

    nextRound(round: number) {
      this.currentRound = round
    },

    endDuel(winnerId: string) {
      this.battleEnded = true
      this.winnerId = winnerId
    },

    clearDuel() {
      this.duelId = ''
      this.challengerId = ''
      this.defenderId = ''
      this.challengerState = null
      this.defenderState = null
      this.battleEnded = false
      this.winnerId = null
    }
  }
})