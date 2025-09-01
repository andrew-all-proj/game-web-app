// hooks/useBattleResponse.ts
import { type RefObject, type Dispatch, type SetStateAction } from 'react'
import { useSocketEvent } from '../../../functions/useSocketEvent'
import { BattleRedis, GetBattleReward, LastActionLog } from '../../../types/BattleRedis'
import { Skill } from '../../../types/GraphResponse'

type Maybe<T> = T | null | undefined
type SetState<T> = Dispatch<SetStateAction<T>>

type Params = {
  selectedMonsterId: Maybe<string>
  setMyAttacks: SetState<Skill[]>
  setMyDefenses: SetState<Skill[]>
  setLastAction: SetState<LastActionLog | null>
  setYourStamina: SetState<number>
  setOpponentStamina: SetState<number>
  setIsBattleOver: SetState<boolean>
  setIsCurrentTurn: SetState<boolean>
  setCurrentTurnMonsterId: SetState<string | null>
  setTurnEndsAtMs: SetState<number | null>
  setTurnTimeLimitMs: SetState<number>
  yourHealthRef: RefObject<number>
  opponentHealthRef: RefObject<number>
  yourHealthBarRef: RefObject<HTMLDivElement>
  opponentHealthBarRef: RefObject<HTMLDivElement>
  serverOffsetRef: RefObject<number>
  lastServerEventRef: RefObject<number>
  defaultTurnLimitMs?: number
  onRejected?: () => void
  onBattleFinished?: (args: { win: boolean; reward: GetBattleReward | null }) => void
  onAnim?: () => void
}

export function useBattleResponse({
  selectedMonsterId,
  setMyAttacks,
  setMyDefenses,
  setLastAction,
  setYourStamina,
  setOpponentStamina,
  setIsBattleOver,
  setIsCurrentTurn,
  setCurrentTurnMonsterId,
  setTurnEndsAtMs,
  setTurnTimeLimitMs,
  yourHealthRef,
  opponentHealthRef,
  yourHealthBarRef,
  opponentHealthBarRef,
  serverOffsetRef,
  lastServerEventRef,
  defaultTurnLimitMs = 15_000,
  onRejected,
  onBattleFinished,
  onAnim,
}: Params) {
  useSocketEvent<BattleRedis>('responseBattle', (data) => {
    if (data.rejected) {
      onRejected?.()
      return
    }

    lastServerEventRef.current = Date.now()
    const me = selectedMonsterId
    if (!me) return

    const iAmChallenger = me === data.challengerMonsterId

    // способности
    setMyAttacks(iAmChallenger ? data.challengerAttacks || [] : data.opponentAttacks || [])
    setMyDefenses(iAmChallenger ? data.challengerDefenses || [] : data.opponentDefenses || [])
    setLastAction(data.lastActionLog ?? null)

    // HP
    const yourHp = iAmChallenger ? data.challengerMonsterHp : data.opponentMonsterHp
    const oppHp = iAmChallenger ? data.opponentMonsterHp : data.challengerMonsterHp
    if (yourHealthRef.current !== yourHp) {
      yourHealthRef.current = yourHp
      if (yourHealthBarRef.current) yourHealthBarRef.current.style.width = `${yourHp}%`
    }
    if (opponentHealthRef.current !== oppHp) {
      opponentHealthRef.current = oppHp
      if (opponentHealthBarRef.current) opponentHealthBarRef.current.style.width = `${oppHp}%`
    }

    // SP
    setYourStamina(iAmChallenger ? data.challengerMonsterStamina : data.opponentMonsterStamina)
    setOpponentStamina(iAmChallenger ? data.opponentMonsterStamina : data.challengerMonsterStamina)

    // server time
    const serverNowMs = data.serverNowMs
    if (serverNowMs && Math.abs(serverNowMs - Date.now()) < 10 * 60 * 1000) {
      serverOffsetRef.current = serverNowMs - Date.now()
    }

    // дедлайны хода
    const nextEndsAt = data.turnEndsAtMs ?? null
    setTurnEndsAtMs(nextEndsAt)
    setTurnTimeLimitMs(data.turnTimeLimit ?? defaultTurnLimitMs)

    // текущий владелец хода
    const nextTurnId = data.currentTurnMonsterId ?? null
    setIsCurrentTurn(me === nextTurnId)
    setCurrentTurnMonsterId(nextTurnId)

    // завершение
    if (data.winnerMonsterId) {
      setIsBattleOver(true)
      const win = me === data.winnerMonsterId
      const reward = (iAmChallenger ? data.challengerGetReward : data.opponentGetReward) || null
      onBattleFinished?.({ win, reward })
    }

    if (me === nextTurnId) {
      onAnim?.()
    }
  })
}
