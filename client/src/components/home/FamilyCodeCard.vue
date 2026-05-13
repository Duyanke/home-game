<template>
  <div class="family-code-card">
    <div class="card-header">
      <span class="card-title">家庭码</span>
    </div>
    <div class="code-display">
      <span class="code-text">{{ familyCode }}</span>
      <button class="copy-btn" @click="copyCode">
        复制
      </button>
    </div>
    <p class="invite-hint">分享此码邀请家人加入</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  familyCode: string
}>()

const copied = ref(false)

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.familyCode)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.family-code-card {
  @include gradient-gold;
  border-radius: $card-radius;
  padding: 24px;
  text-align: center;
}

.card-header {
  margin-bottom: 16px;
}

.card-title {
  color: $color-dark-base;
  font-size: 16px;
}

.code-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  background: rgba($color-dark-base, 0.2);
  padding: 16px;
  border-radius: $button-radius;
}

.code-text {
  color: $color-dark-deep;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 4px;
}

.copy-btn {
  background: $color-dark-base;
  color: $color-gold;
  border: none;
  padding: 8px 16px;
  border-radius: $button-radius;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: $color-dark-light;
  }
}

.invite-hint {
  color: $color-dark-base;
  font-size: 12px;
  margin-top: 12px;
  opacity: 0.8;
}
</style>