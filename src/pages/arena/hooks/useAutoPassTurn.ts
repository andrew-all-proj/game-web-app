import { useEffect, type RefObject } from 'react'
import { getSocket } from '../../../api/socket'
import { ActionStatusEnum } from '../../../types/enums/ActionStatusEnum'

type Params = {
  isCurrentTurn: boolean
  turnEndsAtMs?: number
  currentTurnMonsterId?: string
  selectedMonsterId?: string
  battleId?: string

  serverOffsetRef: RefObject<number>
  autoSkipRef: RefObject<number | null>

  mode?: 'timeout' | 'raf'
  checkEveryMs?: number
}

export function useAutoPassTurn({
  isCurrentTurn,
  turnEndsAtMs,
  currentTurnMonsterId,
  selectedMonsterId,
  battleId,
  serverOffsetRef,
  autoSkipRef,
  mode = 'timeout',
  checkEveryMs = 250,
}: Params) {
  useEffect(() => {
    if (!isCurrentTurn || !turnEndsAtMs) {
      if (autoSkipRef.current !== null) autoSkipRef.current = null
      return
    }

    let canceled = false
    let handle: number | ReturnType<typeof setTimeout>

    const checkAndMaybePass = () => {
      if (canceled) return

      const offset = serverOffsetRef.current ?? 0
      const now = Date.now() + offset

      const shouldAutoPass =
        now >= turnEndsAtMs &&
        !!selectedMonsterId &&
        currentTurnMonsterId === selectedMonsterId &&
        autoSkipRef.current !== turnEndsAtMs

      if (shouldAutoPass) {
        autoSkipRef.current = turnEndsAtMs

        const socket = getSocket()
        if (socket?.connected) {
          socket.emit('attack', {
            battleId,
            actionId: null,
            actionType: ActionStatusEnum.PASS,
            monsterId: selectedMonsterId,
          })
        }
        return
      }

      if (mode === 'raf') {
        handle = requestAnimationFrame(checkAndMaybePass) as unknown as number
      } else {
        handle = setTimeout(checkAndMaybePass, checkEveryMs)
      }
    }

    if (mode === 'raf') {
      handle = requestAnimationFrame(checkAndMaybePass) as unknown as number
    } else {
      handle = setTimeout(checkAndMaybePass, checkEveryMs)
    }

    return () => {
      canceled = true
      if (mode === 'raf') {
        cancelAnimationFrame(handle as number)
      } else {
        clearTimeout(handle as ReturnType<typeof setTimeout>)
      }
    }
  }, [
    isCurrentTurn,
    turnEndsAtMs,
    currentTurnMonsterId,
    selectedMonsterId,
    battleId,
    mode,
    checkEveryMs,
    serverOffsetRef,
    autoSkipRef,
  ])
}
