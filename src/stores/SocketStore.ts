import { makeAutoObservable, runInAction } from 'mobx'
import { connectSocket, disconnectSocket, getSocket } from '../api/socket'

export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

class SocketStore {
  status: SocketStatus = 'disconnected'

  constructor() {
    makeAutoObservable(this)
  }

  init(token?: string) {
    if (token) connectSocket(token)
    this.watch()
  }

  watch() {
    const socket = getSocket()
    if (!socket) {
      this.status = 'disconnected'
      return
    }
    this.status = socket.connected ? 'connected' : 'disconnected'
    socket.on('connect', () =>
      runInAction(() => {
        this.status = 'connected'
      }),
    )
    socket.on('disconnect', () =>
      runInAction(() => {
        this.status = 'disconnected'
      }),
    )
    socket.on('connect_error', () =>
      runInAction(() => {
        this.status = 'error'
      }),
    )
    socket.on('reconnecting', () =>
      runInAction(() => {
        this.status = 'connecting'
      }),
    )
  }

  disconnect() {
    disconnectSocket()
    this.status = 'disconnected'
  }
}

const socketStore = new SocketStore()
export default socketStore
