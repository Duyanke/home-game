// stores/toast.ts - Toast消息状态管理
import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  duration: number
}

export const useToastStore = defineStore('toast', {
  state: () => ({
    messages: [] as ToastMessage[]
  }),

  actions: {
    show(message: string, type: ToastType = 'info', duration = 3000) {
      const id = Date.now().toString() + Math.random().toString(36).slice(2)
      this.messages.push({ id, type, message, duration })
      setTimeout(() => this.remove(id), duration)
    },

    remove(id: string) {
      this.messages = this.messages.filter(m => m.id !== id)
    },

    success(message: string) {
      this.show(message, 'success', 3000)
    },

    error(message: string) {
      this.show(message, 'error', 5000)
    },

    warning(message: string) {
      this.show(message, 'warning', 4000)
    },

    info(message: string) {
      this.show(message, 'info', 3000)
    }
  }
})