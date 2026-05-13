<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">创建新任务</h3>
      <div class="form-group">
        <label class="form-label">任务名称</label>
        <input
          type="text"
          class="form-input"
          v-model="taskName"
          placeholder="输入任务名称"
        />
      </div>
      <div class="form-group">
        <label class="form-label">积分奖励</label>
        <input
          type="number"
          class="form-input"
          v-model.number="taskPoints"
          placeholder="输入积分"
          min="1"
          max="100"
        />
      </div>
      <div class="form-group">
        <label class="form-label">任务类型</label>
        <div class="radio-group">
          <button
            class="radio-btn"
            :class="{ active: isCustom }"
            @click="isCustom = true"
          >
            自定义任务
          </button>
          <button
            class="radio-btn"
            :class="{ active: !isCustom }"
            @click="isCustom = false"
          >
            预设任务
          </button>
        </div>
      </div>
      <div class="modal-actions">
        <button class="cancel-btn" @click="$emit('close')">取消</button>
        <button
          class="confirm-btn"
          :disabled="!taskName || !taskPoints"
          @click="createTask"
        >
          创建
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '@/stores/task'

const emit = defineEmits<{
  close: []
  created: []
}>()

const taskStore = useTaskStore()
const taskName = ref('')
const taskPoints = ref(10)
const isCustom = ref(true)

const createTask = () => {
  if (!taskName.value || !taskPoints.value) return
  taskStore.createTask(taskName.value, taskPoints.value, isCustom.value)
  emit('created')
  emit('close')
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba($color-dark-deep, 0.8);
  @include flex-center;
  z-index: 200;
}

.modal-content {
  @include card-base;
  width: 90%;
  max-width: 400px;
}

.modal-title {
  @include text-title;
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
  border: none;
  padding: 12px;
  border-radius: $button-radius;
  color: $color-text-primary;

  &:focus {
    outline: 2px solid $color-gold;
  }
}

.radio-group {
  display: flex;
  gap: 8px;
}

.radio-btn {
  flex: 1;
  background: $color-dark-deep;
  border: none;
  padding: 12px;
  border-radius: $button-radius;
  color: $color-text-secondary;
  cursor: pointer;

  &.active {
    background: $color-gold;
    color: $color-dark-base;
  }
}

.modal-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.cancel-btn {
  @include button-secondary;
  flex: 1;
}

.confirm-btn {
  @include button-primary;
  flex: 1;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>