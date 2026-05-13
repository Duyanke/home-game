// stores/family.ts - 家庭和成员状态管理
import { defineStore } from 'pinia'
import { sendMessage } from '../services/socket'

export interface Member {
  id: string
  name: string
  points: number
  beastId: string | null
  beastType: string | null
  isOnline: boolean
}

export interface FamilyState {
  familyId: string
  familyCode: string
  memberId: string
  memberName: string
  members: Member[]
  membersOnline: string[]
}

export const useFamilyStore = defineStore('family', {
  state: (): FamilyState => ({
    familyId: '',
    familyCode: '',
    memberId: '',
    memberName: '',
    members: [],
    membersOnline: []
  }),

  getters: {
    myMember: (state) =>
      state.members.find(m => m.id === state.memberId),
    rankedMembers: (state) =>
      [...state.members].sort((a, b) => b.points - a.points),
    myRank: (state) => {
      const sorted = [...state.members].sort((a, b) => b.points - a.points)
      return sorted.findIndex(m => m.id === state.memberId) + 1
    }
  },

  actions: {
    joinFamily(familyCode: string, memberName: string) {
      sendMessage('JOIN_FAMILY', { familyCode, memberName })
    },

    createFamily(memberName: string) {
      sendMessage('CREATE_FAMILY', { memberName })
    },

    setFamilyInfo(familyId: string, familyCode: string, memberId: string, memberName: string) {
      this.familyId = familyId
      this.familyCode = familyCode
      this.memberId = memberId
      this.memberName = memberName
    },

    syncMembers(members: Member[]) {
      this.members = members
    },

    updateMemberStatus(memberId: string, isOnline: boolean) {
      const member = this.members.find(m => m.id === memberId)
      if (member) {
        member.isOnline = isOnline
      }
      if (isOnline && !this.membersOnline.includes(memberId)) {
        this.membersOnline.push(memberId)
      } else if (!isOnline) {
        this.membersOnline = this.membersOnline.filter(id => id !== memberId)
      }
    },

    updateMemberPoints(memberId: string, points: number) {
      const member = this.members.find(m => m.id === memberId)
      if (member) {
        member.points = points
      }
    }
  }
})