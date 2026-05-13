<template>
  <div class="task-item" :class="`status-${task.status}`">
    <div class="task-header">
      <h4 class="task-name">{{ task.name }}</h4>
      <span class="task-points">{{ task.points }}分</span>
    </div>
    <div class="task-meta">
      <span class="task-status">{{ statusLabel }}</span>
      <span class="task-claimer" v-if="task.claimedBy">{{ claimerName }}</span>
    </div>
    <div class="task-actions">
      <button
        v-if="canClaim"
        class="action-btn claim"
        @click="$emit('claim', task.id)"
      >
        领取
      </button>
      <button
        v-if="canComplete"
        class="action-btn complete"
        @click="$emit('complete', task.id)"
      >
        完成
      </button>
      <button
        v-if="canConfirm"
        class="action-btn confirm"
        @click="$emit('confirm', task.id)"
      >
        确认
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  task: {
    id: string
    name: string
    points: number
    status: 'pending' | 'in_progress' | 'completed' | 'confirmed'
    createdBy: string
    claimedBy: string | null
    confirmedBy: string | null
    isCustom: boolean
    createdAt: number
  }
  memberId: string
  members: { id: string; name: string }[]
}>()

defineEmits<{
  claim: [taskId: string]
  complete: [taskId: string]
  confirm: [taskId: string]
}>()

const statusLabels: Record<string, string> = {
  pending: '待领取',
  in_progress: '进行中',
  completed: '待确认',
  confirmed: '已完成'
}

const statusLabel = computed(() => statusLabels[props.task.status] || '')

const claimerName = computed(() => {
  if (!props.task.claimedBy) return ''
  const member = props.members.find(m => m.id === props.task.claimedBy)
  return member?.name || ''
})

const canClaim = computed(() =>
  props.task.status === 'pending' && props.task.createdBy !== props.memberId
)

const canComplete = computed(() =>
  props.task.status === 'in_progress' && props.task.claimedBy === props.memberId
)

const canConfirm = computed(() =>
  props.task.status === 'completed' &&
  props.task.claimedBy !== props.memberId &&
  props.task.createdBy === props.memberId
)
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.task-item {
  @include card-base;
  margin-bottom: 12px;
}

.status-pending { border-left: 3px solid $color-info; }
.status-in_progress { border-left: 3px solid $color-warning; }
.status-completed { border-left: 3px solid $color-success; }
.status-confirmed { border-left: 3px solid $color-gold; }

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-name {
  color: $color-text-primary;
  font-size: 16px;
}

.task-points {
  color: $color-gold;
  font-weight: 600;
}

.task-meta {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.task-status {
  color: $color-text-secondary;
  font-size: 12px;
}

.task-claimer {
  color: $color-text-primary;
  font-size: 12px;
}

.task-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: $button-radius;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;

  &.claim {
    background: $color-info;
    color: white;
  }

  &.complete {
    background: $color-success;
    color: white;
  }

  &.confirm {
    background: linear-gradient(135deg, $color-gold-light, $color-gold-base);
    color: $color-dark-base;
  }
}
</style>