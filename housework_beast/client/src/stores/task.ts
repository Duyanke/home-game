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
      sendMessage('TASK_CREATE', { name, points, isCustom })
    },

    claimTask(taskId: string) {
      sendMessage('TASK_CLAIM', { taskId })
    },

    completeTask(taskId: string) {
      sendMessage('TASK_COMPLETE', { taskId })
    },

    confirmTask(taskId: string) {
      sendMessage('CONFIRM_TASK', { taskId })
    },

    syncTasks(tasks: Task[]) {
      this.tasks = tasks
    },

    addTask(task: Task) {
      const existing = this.tasks.find(t => t.id === task.id)
      if (!existing) {
        this.tasks.push(task)
      }
    },

    updateTask(task: Task) {
      const index = this.tasks.findIndex(t => t.id === task.id)
      if (index !== -1) {
        this.tasks[index] = task
      }
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