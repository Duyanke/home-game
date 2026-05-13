// utils/offlineQueue.ts - 离线操作队列

import { sendMessage } from '../services/socket'

interface QueuedAction {
  id: string
  type: string
  payload: unknown
  timestamp: number
}

const QUEUE_KEY = 'housework_offline_queue'

export function saveToQueue(type: string, payload: unknown): string {
  const queue = loadQueue()
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  queue.push({ id, type, payload, timestamp: Date.now() })
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  return id
}

export function loadQueue(): QueuedAction[] {
  try {
    const data = localStorage.getItem(QUEUE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function processQueue(): number {
  const queue = loadQueue()
  const count = queue.length

  queue.forEach(action => {
    sendMessage(action.type as 'CREATE_TASK' | 'CLAIM_TASK' | 'COMPLETE_TASK' | 'CONFIRM_TASK' | 'SELECT_BEAST', action.payload as Record<string, unknown>)
  })

  clearQueue()
  return count
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY)
}

export function isOnline(): boolean {
  return navigator.onLine
}

export function getQueueLength(): number {
  return loadQueue().length
}