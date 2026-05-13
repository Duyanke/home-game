<template>
  <div class="page-container beast-select-page">
    <BackHeader title="选择你的神兽" />
    <div class="page-content">
      <p class="select-hint">每种神兽有不同的属性和技能，选择后无法更改</p>
      <div class="beast-grid">
        <BeastCard
          v-for="beast in beastTypes"
          :key="beast.type"
          :beast-type="beast.type"
          :is-selected="selectedType === beast.type"
          @select="selectBeast"
        />
      </div>
      <button
        class="confirm-btn"
        :disabled="!selectedType || isConfirming"
        @click="confirmSelect"
      >
        {{ isConfirming ? '确认中...' : '确认选择' }}
      </button>
    </div>
    <Loading :visible="isConfirming" text="正在绑定神兽..." />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@/components/common/BackHeader.vue'
import BeastCard from '@/components/common/BeastCard.vue'
import Loading from '@/components/common/Loading.vue'
import { useToastStore } from '@/stores/toast'
import { useFamilyStore } from '@/stores/family'
import { useBeastStore } from '@/stores/beast'
import { sendMessage, getSocket, rejoinFamily } from '@/services/socket'

const router = useRouter()
const toast = useToastStore()
const familyStore = useFamilyStore()
const beastStore = useBeastStore()
const selectedType = ref<string | null>(null)
const isConfirming = ref(false)

const beastTypes = [
  { type: 'dragon' },
  { type: 'phoenix' },
  { type: 'tiger' },
  { type: 'turtle' },
  { type: 'kirin' }
]

const selectBeast = (type: string) => {
  selectedType.value = type
}

const confirmSelect = () => {
  if (!selectedType.value) {
    toast.warning('请先选择一只神兽')
    return
  }

  // 确保 socket 映射正确
  const socket = getSocket()
  if (socket && socket.connected && familyStore.memberId && familyStore.familyId) {
    // 先发送 REJOIN 确保 socket 映射正确
    rejoinFamily(familyStore.memberId, familyStore.familyId)
  }

  isConfirming.value = true
  sendMessage('SELECT_BEAST', { beastType: selectedType.value })
}

// 监听神兽状态变化，成功后跳转
watch(
  () => beastStore.myBeast,
  (newBeast) => {
    if (newBeast && isConfirming.value) {
      isConfirming.value = false
      router.push('/beast')
    }
  }
)

onMounted(() => {
  const socket = getSocket()
  if (socket) {
    // 监听错误消息
    socket.on('ERROR', (data: { payload: { message: string } }) => {
      isConfirming.value = false
      toast.error(data.payload.message)
    })
  }
})

onUnmounted(() => {
  const socket = getSocket()
  if (socket) {
    socket.off('ERROR')
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.beast-select-page {
  background: $color-dark-base;
}

.select-hint {
  @include text-secondary;
  text-align: center;
  margin-bottom: 24px;
}

.beast-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.confirm-btn {
  @include button-primary;
  width: 100%;
  margin-top: 32px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>