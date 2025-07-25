import { useEffect, useRef } from 'react'
import { getSocket } from '../api/socket'
import socketStore from '../stores/SocketStore'

export function useSocketEvent<T>(event: string, handler: (payload: T) => void): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const eventHandler = (payload: T) => handlerRef.current(payload)
    socket.on(event, eventHandler)
    return () => {
      socket.off(event, eventHandler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, socketStore.status])
}
