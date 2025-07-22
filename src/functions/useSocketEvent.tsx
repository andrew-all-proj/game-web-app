import { useEffect, useRef } from 'react'
import { getSocket } from '../api/socket'
import userStore from '../stores/UserStore'

export function useSocketEvent<T = any>(event: string, handler: (payload: T) => void): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const socket = getSocket()
    if (!socket || !socket.connected) return

    const eventHandler = (payload: T) => handlerRef.current(payload)
    socket.on(event, eventHandler)
    return () => {
      socket.off(event, eventHandler)
    }
  }, [event, userStore.socketStatus])
}
