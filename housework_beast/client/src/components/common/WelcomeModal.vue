<template>
  <div class="welcome-overlay">
    <div class="welcome-modal">
      <h2 class="welcome-title">家务神兽养成游戏</h2>
      <p class="welcome-desc">让家务变得有趣，和家人一起养成你的神兽!</p>

      <div class="form-tabs">
        <button
          class="tab-btn"
          :class="{ active: mode === 'create' }"
          @click="mode = 'create'"
        >
          创建家庭
        </button>
        <button
          class="tab-btn"
          :class="{ active: mode === 'join' }"
          @click="mode = 'join'"
        >
          加入家庭
        </button>
      </div>

      <div class="form-content">
        <div class="form-group">
          <label class="form-label">你的名字</label>
          <input
            type="text"
            class="form-input"
            v-model="memberName"
            placeholder="输入你的名字"
            maxlength="20"
          />
        </div>

        <div class="form-group" v-if="mode === 'join'">
          <label class="form-label">家庭码</label>
          <input
            type="text"
            class="form-input"
            v-model="familyCode"
            placeholder="输入家庭码"
            maxlength="6"
          />
        </div>

        <p class="form-hint" v-if="mode === 'create'">
          创建家庭后，你将获得一个家庭码，可以邀请家人加入
        </p>
      </div>

      <button
        class="submit-btn"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        {{ mode === 'create' ? '创建并开始' : '加入家庭' }}
      </button>

      <div class="error-message" v-if="errorMsg">
        {{ errorMsg }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFamilyStore } from '@/stores/family'
import { connectSocket } from '@/services/socket'

const emit = defineEmits<{
  success: []
}>()

const familyStore = useFamilyStore()
const mode = ref<'create' | 'join'>('create')
const memberName = ref('')
const familyCode = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

const canSubmit = computed(() => {
  if (!memberName.value.trim()) return false
  if (mode.value === 'join' && !familyCode.value.trim()) return false
  return !isLoading.value
})

const handleSubmit = async () => {
  if (!canSubmit.value) return

  isLoading.value = true
  errorMsg.value = ''

  const socket = connectSocket('http://localhost:3000')

  // 监听确认响应
  socket.once('HELLO_ACK', (data: { payload: { success: boolean; familyId: string; familyCode: string; memberId: string } }) => {
    isLoading.value = false

    if (data.payload.success) {
      // 使用后端返回的家庭码
      const code = data.payload.familyCode || familyCode.value.trim()

      familyStore.setFamilyInfo(
        data.payload.familyId,
        code,
        data.payload.memberId,
        memberName.value.trim()
      )

      // 本地存储以便下次访问
      localStorage.setItem('familyCode', code)
      localStorage.setItem('familyId', data.payload.familyId)
      localStorage.setItem('memberId', data.payload.memberId)
      localStorage.setItem('memberName', memberName.value.trim())

      emit('success')
    }
  })

  socket.once('ERROR', (data: { payload: { message: string } }) => {
    isLoading.value = false
    errorMsg.value = data.payload.message
  })

  // 发送 HELLO 事件（匹配后端）
  const codeToSend = mode.value === 'create' ? '' : familyCode.value.trim().toUpperCase()

  socket.emit('HELLO', {
    type: 'HELLO',
    payload: {
      familyCode: codeToSend,
      memberName: memberName.value.trim()
    },
    timestamp: Date.now()
  })
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.welcome-overlay {
  position: fixed;
  inset: 0;
  background: $color-dark-deep;
  @include flex-center;
  z-index: 1000;
}

.welcome-modal {
  background: $color-dark-light;
  border-radius: $card-radius;
  padding: 32px;
  width: 90%;
  max-width: 400px;
}

.welcome-title {
  @include text-title;
  text-align: center;
  margin-bottom: 8px;
}

.welcome-desc {
  @include text-secondary;
  text-align: center;
  margin-bottom: 24px;
}

.form-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  background: $color-dark-deep;
  border: none;
  padding: 12px;
  border-radius: $button-radius;
  color: $color-text-secondary;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    @include gradient-gold;
    color: $color-dark-base;
  }
}

.form-content {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  @include text-secondary;
  font-size: 14px;
  margin-bottom: 8px;
  display: block;
}

.form-input {
  width: 100%;
  background: $color-dark-deep;
  border: 1px solid $color-dark-deep;
  padding: 12px;
  border-radius: $button-radius;
  color: $color-text-primary;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: $color-gold;
  }
}

.form-hint {
  @include text-secondary;
  font-size: 12px;
}

.submit-btn {
  @include button-primary;
  width: 100%;
  padding: 16px;
  font-size: 18px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: rgba($color-error, 0.2);
  border-radius: $button-radius;
  color: $color-error;
  text-align: center;
  font-size: 14px;
}
</style>