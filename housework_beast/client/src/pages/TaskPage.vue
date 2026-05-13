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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BackHeader from '@/components/common/BackHeader.vue'
import TaskFilter from '@/components/task/TaskFilter.vue'
import TaskItem from '@/components/common/TaskItem.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import TaskCreateModal from '@/components/task/TaskCreateModal.vue'
import { useTaskStore } from '@/stores/task'
import { useFamilyStore } from '@/stores/family'
import { getSocket } from '@/services/socket'

const taskStore = useTaskStore()
const familyStore = useFamilyStore()
const showModal = ref(false)

const claimTask = (taskId: string) => {
  taskStore.claimTask(taskId)
}

const completeTask = (taskId: string) => {
  taskStore.completeTask(taskId)
}

const confirmTask = (taskId: string) => {
  taskStore.confirmTask(taskId)
}

onMounted(() => {
  const socket = getSocket()
  if (socket) {
    socket.on('TASK_SYNC', (data) => {
      taskStore.syncTasks(data.payload.tasks)
    })
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