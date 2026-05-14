<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">创建新任务</h3>

      <!-- 任务类型选择 -->
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

      <!-- 自定义任务输入 -->
      <div v-if="isCustom">
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
      </div>

      <!-- 预设任务列表 -->
      <div v-if="!isCustom" class="preset-list">
        <label class="form-label">选择预设任务</label>
        <div class="preset-grid">
          <button
            v-for="task in presetTasks"
            :key="task.name"
            class="preset-item"
            :class="{ selected: selectedPreset?.name === task.name }"
            @click="selectPreset(task)"
          >
            <span class="preset-name">{{ task.name }}</span>
            <span class="preset-points">{{ task.points }}分</span>
          </button>
        </div>
      </div>

      <div class="modal-actions">
        <button class="cancel-btn" @click="$emit('close')">取消</button>
        <button
          class="confirm-btn"
          :disabled="!canCreate"
          @click="createTask"
        >
          创建
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useFamilyStore } from '@/stores/family'
import { useToastStore } from '@/stores/toast'
import { getSocket, rejoinFamily } from '@/services/socket'
import { validateTaskName, validateTaskPoints } from '@/utils/validators'
import { PRESET_TASKS } from '@/constants/beast-data'

const emit = defineEmits<{
  close: []
  created: []
}>()

const taskStore = useTaskStore()
const familyStore = useFamilyStore()
const toast = useToastStore()
const taskName = ref('')
const taskPoints = ref(10)
const isCustom = ref(true)
const isSubmitting = ref(false)
const selectedPreset = ref<{ name: string; points: number } | null>(null)

const presetTasks = PRESET_TASKS

const selectPreset = (task: { name: string; points: number }) => {
  selectedPreset.value = task
}

const canCreate = computed(() => {
  if (isCustom.value) {
    return taskName.value && taskPoints.value > 0
  }
  return selectedPreset.value !== null
})

const createTask = () => {
  // 根据类型获取任务数据
  const name = isCustom.value ? taskName.value : selectedPreset.value?.name
  const points = isCustom.value ? taskPoints.value : selectedPreset.value?.points

  if (!name || !points) {
    toast.error('请填写完整任务信息')
    return
  }

  // 验证任务名称（仅自定义任务需要验证）
  if (isCustom.value) {
    const nameResult = validateTaskName(name)
    if (!nameResult.valid) {
      toast.error(nameResult.errors[0])
      return
    }

    const pointsResult = validateTaskPoints(points)
    if (!pointsResult.valid) {
      toast.error(pointsResult.errors[0])
      return
    }
  }

  // 确保 socket 映射正确
  const socket = getSocket()
  if (socket && socket.connected && familyStore.memberId && familyStore.familyId) {
    rejoinFamily(familyStore.memberId, familyStore.familyId)
  }

  isSubmitting.value = true
  taskStore.createTask(name, points, isCustom.value)
  toast.success('任务创建成功')
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
  max-height: 80vh;
  overflow-y: auto;
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

.preset-list {
  margin-bottom: 16px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.preset-item {
  @include card-base;
  padding: 12px;
  background: $color-dark-deep;
  border: 2px solid transparent;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;

  &.selected {
    border-color: $color-gold;
    background: rgba($color-gold, 0.1);
  }

  &:hover {
    background: rgba($color-gold, 0.05);
  }
}

.preset-name {
  display: block;
  color: $color-text-primary;
  font-size: 14px;
}

.preset-points {
  display: block;
  color: $color-gold;
  font-size: 12px;
  margin-top: 4px;
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