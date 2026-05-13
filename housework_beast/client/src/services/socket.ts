// socket.ts - Socket.IO 连接管理
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function connectSocket(serverUrl: string): Socket {
  if (!socket) {
    socket = io(serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })
  }
  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function sendMessage<T>(type: string, payload: T): void {
  if (socket) {
    socket.emit(type, {
      type,
      payload,
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