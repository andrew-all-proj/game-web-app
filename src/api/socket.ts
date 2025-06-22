import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

let onReconnectCallbacks: (() => void)[] = []

export const connectSocket = (token: string, onReconnect?: () => void): Socket => {
  if (socket?.connected) return socket

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
  })

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id)
    onReconnectCallbacks.forEach((cb) => cb())
  })

  if (onReconnect) {
    onReconnectCallbacks.push(onReconnect)
  }

  return socket
}

export const getSocket = (): Socket | null => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    onReconnectCallbacks = []
  }
}
