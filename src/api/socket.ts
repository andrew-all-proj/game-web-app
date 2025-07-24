import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const connectSocket = (token: string): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      if (socket && socket.connected) return resolve(socket)

      if (socket && !socket.connected) {
        const onConnect = () => {
          cleanup()
          resolve(socket!)
        }
        const onError = (err: unknown) => {
          cleanup()
          reject(err)
        }
        const cleanup = () => {
          socket?.off('connect', onConnect)
          socket?.off('connect_error', onError)
        }
        socket.once('connect', onConnect)
        socket.once('connect_error', onError)
        return
      }

      if (socket) {
        socket.disconnect()
        await new Promise((resolveClose) => {
          socket!.once('close', resolveClose)
        })
        socket = null
      }

      socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
        transports: ['websocket'],
        auth: { token },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
      })

      const cleanup = () => {
        if (!socket) return
        socket.off('connect', onConnect)
        socket.off('connect_error', onError)
      }

      function onConnect() {
        cleanup()
        resolve(socket!)
      }
      function onError(err: unknown) {
        cleanup()
        reject(err)
      }

      socket.once('connect', onConnect)
      socket.once('connect_error', onError)
    })()
  })
}

export const getSocket = (): Socket | null => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
