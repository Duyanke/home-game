// socket.ts - Socket.IO 连接管理
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

// 事件回调存储
const eventCallbacks: Map<string, Set<(data: any) => void>> = new Map()

// 注册全局事件回调
export function registerSocketCallback(event: string, callback: (data: any) => void): void {
  console.log('[Socket] registerSocketCallback:', event)
  if (!eventCallbacks.has(event)) {
    eventCallbacks.set(event, new Set())
  }
  eventCallbacks.get(event)!.add(callback)

  // 如果 socket 已存在且已连接，立即注册监听
  if (socket && socket.connected) {
    socket.on(event, callback)
    console.log('[Socket] registered to existing socket:', event)
  }
}

// 移除事件回调
export function removeSocketCallback(event: string, callback: (data: any) => void): void {
  const callbacks = eventCallbacks.get(event)
  if (callbacks) {
    callbacks.delete(callback)
    if (socket) {
      socket.off(event, callback)
    }
  }
}

export function connectSocket(serverUrl: string): Socket {
  if (!socket) {
    socket = io(serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    // 连接成功后注册所有已存储的回调
    socket.on('connect', () => {
      console.log('[Socket] connected, registering callbacks')
      eventCallbacks.forEach((callbacks, event) => {
        callbacks.forEach(cb => {
          socket!.on(event, cb)
        })
      })
    })
  }
  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    // 移除所有监听器
    eventCallbacks.forEach((callbacks, event) => {
      callbacks.forEach(cb => socket!.off(event, cb))
    })
    socket.disconnect()
    socket = null
  }
}

export function sendMessage<T>(type: string, payload: T): void {
  console.log('[Socket] sendMessage:', type, 'connected:', socket?.connected)
  if (socket) {
    // 不管是否连接，都尝试发送（socket.io 会自动处理）
    socket.emit(type, {
      type,
      payload,
      timestamp: Date.now()
    })
  } else {
    console.warn('[Socket] No socket, message not sent:', type)
  }
}

// 恢复登录状态（重连时使用）
export function rejoinFamily(memberId: string, familyId: string): void {
  console.log('[Socket] rejoinFamily:', memberId, familyId)
  if (socket) {
    socket.emit('REJOIN', {
      type: 'REJOIN',
      payload: { memberId, familyId },
      timestamp: Date.now()
    })
  }
}

export function setupSocketErrorHandlers(
  socket: Socket,
  callbacks: {
    onError: (message: string) => void
    onDisconnect: () => void
    onReconnect?: () => void
  }
): void {
  socket.on('connect_error', () => callbacks.onError('连接服务器失败'))
  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      callbacks.onError('服务器已断开连接')
    } else {
      callbacks.onDisconnect()
    }
  })
  socket.on('reconnect', () => {
    if (callbacks.onReconnect) {
      callbacks.onReconnect()
    }
  })
  socket.on('ERROR', (msg: { payload: { message: string } }) => callbacks.onError(msg.payload.message))
}