<template>
  <div class="page-container task-page">
    <BackHeader title="任务中心">
      <template #extra>
        <button class="create-btn" @click="showModal = true">+</button>
      </template>
    </BackHeader>
    <div class="page-content">
      <TaskFilter :filter="taskStore.filter" @change="taskStore.setFilter" />
      <div class="task-list">
        <TaskItem
          v-for="task in taskStore.filteredTasks"
          :key="task.id"
          :task="task"
          :member-id="familyStore.memberId"
          :members="familyStore.members"
          @claim="claimTask"
          @complete="completeTask"
          @confirm="confirmTask"
        />
      </div>
      <div class="empty-hint" v-if="taskStore.filteredTasks.length === 0">
        暂无任务
      </div>
    </div>
    <BottomNav />
    <TaskCreateModal
      v-if="showModal"
      @close="showModal = false"
      @created="showModal = false"
    />
    <TaskCompleteEffect
      :active="showCompleteEffect"
      :points="earnedPoints"
      @complete="showCompleteEffect = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BackHeader from '@/components/common/BackHeader.vue'
import TaskFilter from '@/components/task/TaskFilter.vue'
import TaskItem from '@/components/common/TaskItem.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import TaskCreateModal from '@/components/task/TaskCreateModal.vue'
import TaskCompleteEffect from '@/components/effects/TaskCompleteEffect.vue'
import { useTaskStore } from '@/stores/task'
import type { Task } from '@/stores/task'
import { useFamilyStore } from '@/stores/family'
import { getSocket } from '@/services/socket'

const taskStore = useTaskStore()
const familyStore = useFamilyStore()
const showModal = ref(false)
const showCompleteEffect = ref(false)
const earnedPoints = ref(0)

const claimTask = (taskId: string) => {
  taskStore.claimTask(taskId)
}

const completeTask = (taskId: string) => {
  taskStore.completeTask(taskId)
}

const confirmTask = (taskId: string) => {
  const task = taskStore.tasks.find(t => t.id === taskId)
  if (task) {
    earnedPoints.value = task.points || 50
    taskStore.confirmTask(taskId)
  }
}

onMounted(() => {
  const socket = getSocket()
  if (socket) {
    // 监听数据同步
    socket.on('SYNC_DATA', (data: { payload: { tasks: any[] } }) => {
      const tasks = data.payload.tasks.map(t => ({
        id: t.task_id,
        name: t.name,
        points: t.points,
        status: t.status as Task['status'],
        createdBy: t.creator_id,
        claimedBy: t.executor_id,
        confirmedBy: t.confirmed_by,
        isCustom: t.is_custom,
        createdAt: t.created_at
      }))
      taskStore.syncTasks(tasks)
    })

    // 监听错误消息
    socket.on('ERROR', (data: { payload: { message: string } }) => {
      console.error('Socket error:', data.payload.message)
    })

    // 监听广播事件
    socket.on('BROADCAST', (data: { payload: { event: string; data: any } }) => {
      const { event, data: eventData } = data.payload

      if (event === 'TASK_CREATED') {
        const task: Task = {
          id: eventData.id || eventData.task_id,
          name: eventData.name,
          points: eventData.points,
          status: eventData.status || 'pending',
          createdBy: eventData.createdBy || eventData.creator_id,
          claimedBy: eventData.claimedBy || eventData.executor_id,
          confirmedBy: eventData.confirmedBy || eventData.confirmed_by,
          isCustom: eventData.isCustom ?? eventData.is_custom ?? true,
          createdAt: eventData.createdAt || eventData.created_at
        }
        taskStore.addTask(task)
      }

      if (event === 'TASK_UPDATED') {
        const task: Task = {
          id: eventData.id || eventData.task_id,
          name: eventData.name,
          points: eventData.points,
          status: eventData.status,
          createdBy: eventData.createdBy || eventData.creator_id,
          claimedBy: eventData.claimedBy || eventData.executor_id,
          confirmedBy: eventData.confirmedBy || eventData.confirmed_by,
          isCustom: eventData.isCustom ?? eventData.is_custom ?? true,
          createdAt: eventData.createdAt || eventData.created_at
        }
        taskStore.updateTask(task)

        // 如果任务确认完成，显示效果
        if (eventData.status === 'confirmed' && eventData.executor_id === familyStore.memberId) {
          earnedPoints.value = eventData.points || 50
          showCompleteEffect.value = true
        }
      }
    })
  }
})

onUnmounted(() => {
  const socket = getSocket()
  if (socket) {
    socket.off('SYNC_DATA')
    socket.off('ERROR')
    socket.off('BROADCAST')
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.task-page {
  background: $color-dark-base;
}

.create-btn {
  background: $color-gold;
  color: $color-dark-base;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
}

.task-list {
  margin-top: 16px;
}

.empty-hint {
  @include text-secondary;
  text-align: center;
  padding: 48px;
}
</style>