// stores/beast.ts - 神兽状态管理
import { defineStore } from 'pinia'
import { sendMessage } from '../services/socket'
import { useFamilyStore } from './family'
import type { BeastStats } from '../constants/beast-data'

export interface Beast {
  id: string
  memberId: string
  type: string
  stage: number
  stats: BeastStats
  skills: string[]
  growthPoints: number
}

export interface BeastState {
  myBeast: Beast | null
  allBeasts: Beast[]
}

export const useBeastStore = defineStore('beast', {
  state: (): BeastState => ({
    myBeast: null,
    allBeasts: []
  }),

  getters: {
    myBeastType: (state) => state.myBeast?.type || null,
    myBeastStage: (state) => state.myBeast?.stage || 1,
    hasBeast: (state) => state.myBeast !== null,
    opponentBeasts(): Beast[] {
      const familyStore = useFamilyStore()
      return this.allBeasts.filter(b => b.memberId !== familyStore.memberId)
    }
  },

  actions: {
    selectBeast(beastType: string) {
      sendMessage('SELECT_BEAST', { beastType })
    },

    setMyBeast(beast: Beast | null) {
      this.myBeast = beast
    },

    syncBeasts(beasts: Beast[]) {
      this.allBeasts = beasts
      const familyStore = useFamilyStore()
      this.myBeast = beasts.find(b => b.memberId === familyStore.memberId) || null
    },

    updateBeastStage(memberId: string, newStage: number) {
      const beast = this.allBeasts.find(b => b.memberId === memberId)
      if (beast) {
        beast.stage = newStage
      }
      if (this.myBeast?.memberId === memberId) {
        this.myBeast.stage = newStage
      }
    },

    updateBeastStats(memberId: string, stats: BeastStats) {
      const beast = this.allBeasts.find(b => b.memberId === memberId)
      if (beast) {
        beast.stats = stats
      }
      if (this.myBeast?.memberId === memberId) {
        this.myBeast.stats = stats
      }
    },

    updateBeastSkills(memberId: string, skills: string[]) {
      const beast = this.allBeasts.find(b => b.memberId === memberId)
      if (beast) {
        beast.skills = skills
      }
      if (this.myBeast?.memberId === memberId) {
        this.myBeast.skills = skills
      }
    }
  }
})