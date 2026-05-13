<template>
  <div class="page-container beast-page">
    <BackHeader :title="pageTitle" />
    <div class="page-content">
      <div class="beast-display">
        <BeastAvatar
          :beast-type="beastStore.myBeastType || 'dragon'"
          :stage="beastStore.myBeastStage"
          :show-stage="true"
          :is-hit="false"
        />
      </div>
      <GrowthProgress
        :current-points="beastStore.myBeast?.growthPoints || 0"
        :stage="beastStore.myBeastStage"
      />
      <BeastStats :stats="beastStore.myBeast?.stats || defaultStats" />
      <SkillList
        :beast-type="beastStore.myBeastType || 'dragon'"
        :current-stage="beastStore.myBeastStage"
        :unlocked-skills="beastStore.myBeast?.skills || []"
      />
      <button class="change-beast-btn" @click="showChangeWarning = true">
        切换神兽
      </button>
    </div>
    <BottomNav />

    <div class="modal-overlay" v-if="showChangeWarning" @click.self="showChangeWarning = false">
      <div class="modal-content">
        <p class="warning-text">切换神兽将重置所有进度，是否继续？</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showChangeWarning = false">取消</button>
          <button class="confirm-btn" @click="goToSelect">确认</button>
        </div>
      </div>
    </div>

    <EvolutionEffect
      :active="showEvolution"
      :element="element"
      :stage-name="evolutionData.stageName"
      :new-skill="evolutionData.newSkill"
      @complete="showEvolution = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@/components/common/BackHeader.vue'
import BeastAvatar from '@/components/common/BeastAvatar.vue'
import GrowthProgress from '@/components/beast/GrowthProgress.vue'
import BeastStats from '@/components/beast/BeastStats.vue'
import SkillList from '@/components/beast/SkillList.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import EvolutionEffect from '@/components/effects/EvolutionEffect.vue'
import { useBeastStore } from '@/stores/beast'
import { useFamilyStore } from '@/stores/family'
import { getSocket } from '@/services/socket'

const router = useRouter()
const beastStore = useBeastStore()
const familyStore = useFamilyStore()
const showChangeWarning = ref(false)
const showEvolution = ref(false)
const evolutionData = ref({ stageName: '', newSkill: '' })

const beastNames: Record<string, string> = {
  dragon: '青龙',
  phoenix: '朱雀',
  tiger: '白虎',
  turtle: '玄武',
  kirin: '麒麟'
}

const elementMap: Record<string, string> = {
  dragon: 'wood',
  phoenix: 'fire',
  tiger: 'metal',
  turtle: 'water',
  kirin: 'light'
}

const stageNames: Record<number, string> = {
  1: '幼年期',
  2: '成年期',
  3: '进化期',
  4: '神圣期'
}

const pageTitle = computed(() => {
  if (!beastStore.myBeastType) return '选择神兽'
  return beastNames[beastStore.myBeastType] || '神兽'
})

const element = computed(() => elementMap[beastStore.myBeastType || 'dragon'] || 'wood')

const defaultBaseStats: Record<string, { hp: number; atk: number; def: number; spd: number }> = {
  dragon: { hp: 100, atk: 12, def: 8, spd: 10 },
  phoenix: { hp: 80, atk: 15, def: 5, spd: 12 },
  tiger: { hp: 90, atk: 14, def: 7, spd: 11 },
  turtle: { hp: 120, atk: 8, def: 12, spd: 6 },
  kirin: { hp: 85, atk: 13, def: 6, spd: 13 }
}

const defaultStats = computed(() => {
  const type = beastStore.myBeastType || 'dragon'
  return defaultBaseStats[type] || defaultBaseStats['dragon']
})

const goToSelect = () => {
  showChangeWarning.value = false
  router.push('/beast/select')
}

onMounted(() => {
  const socket = getSocket()
  if (socket) {
    socket.on('BEAST_STAGE_UP', (data: { payload: { memberId: string; newStage: number; newSkills?: string[] } }) => {
      if (data.payload.memberId === familyStore.memberId) {
        evolutionData.value = {
          stageName: stageNames[data.payload.newStage] || '成年期',
          newSkill: data.payload.newSkills?.[0] || ''
        }
        showEvolution.value = true
      }
    })
  }
})

onUnmounted(() => {
  const socket = getSocket()
  if (socket) {
    socket.off('BEAST_STAGE_UP')
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.beast-page {
  background: $color-dark-base;
}

.beast-display {
  @include flex-center;
  padding: 32px;
}

.change-beast-btn {
  @include button-secondary;
  width: 100%;
  margin-top: 24px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba($color-dark-deep, 0.8);
  @include flex-center;
  z-index: 200;
}

.modal-content {
  @include card-base;
  text-align: center;
}

.warning-text {
  @include text-primary;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 16px;
}

.cancel-btn {
  @include button-secondary;
  flex: 1;
}

.confirm-btn {
  @include button-primary;
  flex: 1;
}
</style>