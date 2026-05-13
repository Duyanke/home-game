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
        :disabled="!selectedType"
        @click="confirmSelect"
      >
        确认选择
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@/components/common/BackHeader.vue'
import BeastCard from '@/components/common/BeastCard.vue'
import { sendMessage } from '@/services/socket'

const router = useRouter()
const selectedType = ref<string | null>(null)

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
  if (!selectedType.value) return
  sendMessage('SELECT_BEAST', { beastType: selectedType.value })
  router.push('/beast')
}
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