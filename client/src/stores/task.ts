// stores/task.ts - 任务状态管理
import { defineStore } from 'pinia'
import { sendMessage } from '../services/socket'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'confirmed'
export type TaskFilter = 'all' | TaskStatus

export interface Task {
  id: string
  name: string
  points: number
  status: TaskStatus
  createdBy: string
  claimedBy: string | null
  confirmedBy: string | null
  isCustom: boolean
  createdAt: number
}

export interface TaskState {
  tasks: Task[]
  filter: TaskFilter
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    tasks: [],
    filter: 'all'
  }),

  getters: {
    filteredTasks: (state) => {
      if (state.filter === 'all') {
        return state.tasks
      }
      return state.tasks.filter(t => t.status === state.filter)
    },
    pendingTasks: (state) =>
      state.tasks.filter(t => t.status === 'pending'),
    inProgressTasks: (state) =>
      state.tasks.filter(t => t.status === 'in_progress'),
    completedTasks: (state) =>
      state.tasks.filter(t => t.status === 'completed')
  },

  actions: {
    createTask(name: string, points: number, isCustom: boolean) {
      sendMessage('CREATE_TASK', { name, points, isCustom })
    },

    claimTask(taskId: string) {
      sendMessage('CLAIM_TASK', { taskId })
    },

    completeTask(taskId: string) {
      sendMessage('COMPLETE_TASK', { taskId })
    },

    confirmTask(taskId: string) {
      sendMessage('CONFIRM_TASK', { taskId })
    },

    syncTasks(tasks: Task[]) {
      this.tasks = tasks
    },

    setFilter(filter: TaskFilter) {
      this.filter = filter
    },

    updateTaskStatus(taskId: string, status: TaskStatus) {
      const task = this.tasks.find(t => t.id === taskId)
      if (task) {
        task.status = status
      }
    }
  }
})