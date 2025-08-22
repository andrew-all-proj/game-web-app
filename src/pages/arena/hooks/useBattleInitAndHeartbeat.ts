// useBattleInitAndHeartbeat.ts
import { RefObject, useEffect } from 'react'
import { getSocket } from '../../../api/socket'

type Params = {
  battleId?: string
  isLoading: boolean
  selectedMonsterId?: string
  opponentMonsterId?: string
  userToken?: string
  lastServerEventRef: RefObject<number>
  silentThresholdMs: number
  checkIntervalMs?: number
}

export function useBattleInitAndHeartbeat({
  battleId,
  isLoading,
  selectedMonsterId,
  opponentMonsterId,
  userToken,
  lastServerEventRef,
  silentThresholdMs,
  checkIntervalMs = 10_000,
}: Params) {
  useEffect(() => {
    if (!isLoading) return
    ;(async () => {
      if (!selectedMonsterId || !opponentMonsterId) return
      if (!userToken) return

      const socket = getSocket()
      if (!socket) return

      socket.emit('getBattle', {
        battleId,
        monsterId: selectedMonsterId,
      })

      socket.emit('startBattle', {
        battleId,
        monsterId: selectedMonsterId,
      })
    })()
  }, [battleId, isLoading, selectedMonsterId, opponentMonsterId, userToken])

  useEffect(() => {
    if (!battleId || !selectedMonsterId) return

    const socket = getSocket()
    if (!socket) return

    const check = () => {
      const silentMs = Date.now() - lastServerEventRef.current
      if (silentMs >= silentThresholdMs && socket.connected) {
        socket.emit('statusBattle', { battleId })
        lastServerEventRef.current = Date.now()
      }
    }

    const id = setInterval(check, checkIntervalMs)
    document.addEventListener('visibilitychange', check)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', check)
    }
  }, [battleId, selectedMonsterId, silentThresholdMs, checkIntervalMs, lastServerEventRef])
}
