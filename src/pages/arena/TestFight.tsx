import { useLayoutEffect, useRef, useState } from 'react'
import monsterStore from '../../stores/MonsterStore'
import styles from './TestFight.module.css'
import { getSocket } from '../../api/socket'
import userStore from '../../stores/UserStore'
import { GetBattleReward, LastActionLog } from '../../types/BattleRedis'
import { useNavigate } from 'react-router-dom'
import { SpriteAtlas } from '../../types/sprites'
import { Skill } from '../../types/GraphResponse'
import HeaderBattle from './HeaderBattle'
import BottomBattlteMenu from './BottomBattlteMenu'
import { showTopAlert } from '../../components/TopAlert/topAlertBus'
import { useBattleInitAndHeartbeat } from './hooks/useBattleInitAndHeartbeat'
import { useAutoPassTurn } from './hooks/useAutoPassTurn'
import { useBattleResponse } from './hooks/useBattleResponse'
import { usePhaserBattleScene } from './hooks/usePhaserBattleScene'

const DEFAULT_TURN_LIMIT = 15_000
const CHECK_BATTLE_LIMIT = 18_000

interface TestFightProps {
  battleId: string
  atlas: SpriteAtlas
  atlasOpponent: SpriteAtlas
  spriteUrlOpponent: string
  spriteUrl: string
  setBattleResult: React.Dispatch<
    React.SetStateAction<{ win: boolean; reward: GetBattleReward | null } | null>
  >
}

export default function TestFight({
  battleId,
  atlas,
  atlasOpponent,
  spriteUrl,
  spriteUrlOpponent,
  setBattleResult,
}: TestFightProps) {
  const yourHealthRef = useRef<number>(100)
  const opponentHealthRef = useRef<number>(100)
  const yourHealthBarRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>
  const opponentHealthBarRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>

  const [isLoading, setIsLoading] = useState(true)
  const [isCurrentTurn, setIsCurrentTurn] = useState(false)
  const [turnEndsAtMs, setTurnEndsAtMs] = useState<number | null>(null)
  const [turnTimeLimitMs, setTurnTimeLimitMs] = useState<number>(DEFAULT_TURN_LIMIT)
  const serverOffsetRef = useRef<number>(0) // serverNow - clientNow
  const [currentTurnMonsterId, setCurrentTurnMonsterId] = useState<string | null>(null)
  const [isBattleOver, setIsBattleOver] = useState(false)
  const [myAttacks, setMyAttacks] = useState<Skill[]>([])
  const [myDefenses, setMyDefenses] = useState<Skill[]>([])
  const [lastAction, setLastAction] = useState<LastActionLog | null>(null)
  const [yourStamina, setYourStamina] = useState(0)
  const [opponentStamina, setOpponentStamina] = useState(0)
  const navigate = useNavigate()
  const autoSkipRef = useRef<number | null>(null)
  const lastServerEventRef = useRef<number>(Date.now())

  // Initialization of battle + heartbeat
  useBattleInitAndHeartbeat({
    battleId,
    isLoading,
    selectedMonsterId: monsterStore.selectedMonster?.id,
    opponentMonsterId: monsterStore.opponentMonster?.id,
    userToken: userStore.user?.token,
    lastServerEventRef,
    silentThresholdMs: CHECK_BATTLE_LIMIT,
    checkIntervalMs: 10_000,
  })

  // Autopass by turn deadline
  useAutoPassTurn({
    isCurrentTurn,
    turnEndsAtMs: turnEndsAtMs ?? undefined,
    currentTurnMonsterId: currentTurnMonsterId ?? undefined,
    selectedMonsterId: monsterStore.selectedMonster?.id,
    battleId,
    serverOffsetRef,
    autoSkipRef,
  })

  // Subscribe to responseBattle
  useBattleResponse({
    selectedMonsterId: monsterStore.selectedMonster?.id,

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

    defaultTurnLimitMs: DEFAULT_TURN_LIMIT,

    onRejected: () => {
      showTopAlert({ open: true, variant: 'error', text: 'Ошибка боя, бой отменен' })
      navigate('/search-battle')
    },

    onBattleFinished: ({ win, reward }) => {
      showGameOver(win)
      setBattleResult({ win, reward })
    },

    onAnim: () => {
      animateOpponentHit()
    },
  })

  // Phaser сцена через хук
  const { containerRef, animateYourHit, animateOpponentHit, showGameOver } = usePhaserBattleScene({
    atlas,
    atlasOpponent,
    spriteUrl,
    spriteUrlOpponent,
    setIsLoading,
    yourHealthRef,
    opponentHealthRef,
    youLabel: monsterStore.selectedMonster?.name || 'Вы',
    opponentLabel: monsterStore.opponentMonster?.name || 'Соперник',
  })

  // Отправка выбранных действий
  const handleConfirm = (attackId: string | null, defenseId: string | null) => {
    if (isLoading || !battleId || !monsterStore.selectedMonster?.id) return
    if (monsterStore.selectedMonster.id !== currentTurnMonsterId) return
    const costOf = (id: string | null, list: Skill[]) =>
      id ? (list.find((s) => s.id === id)?.energyCost ?? 0) : 0

    const totalCost = costOf(attackId, myAttacks) + costOf(defenseId, myDefenses)
    if (totalCost > yourStamina) {
      alert(`Недостаточно SP: у вас ${yourStamina} SP, требуется ${totalCost} SP`)
      return
    }

    const socket = getSocket()
    if (!socket || !socket.connected) return

    socket.emit('attack', {
      battleId,
      monsterId: monsterStore.selectedMonster.id,
      attackId, // string | null
      defenseId, // string | null
    })

    // локальная анимация:
    if (attackId) {
      animateYourHit()
    }
  }

  // CSS-переменные под высоты шапки/меню
  useLayoutEffect(() => {
    const setVars = () => {
      const header = document.querySelector('#battle-header')
      const menu = document.querySelector('#bottom-menu')
      document.documentElement.style.setProperty('--header-h', `${header?.clientHeight ?? 110}px`)
      document.documentElement.style.setProperty('--menu-h', `${menu?.clientHeight ?? 240}px`)
    }
    setVars()
    window.addEventListener('resize', setVars)
    return () => window.removeEventListener('resize', setVars)
  }, [])

  return (
    <>
      <HeaderBattle
        chalengerHealth={yourHealthRef.current ?? 0}
        maxChalengerHealth={monsterStore.selectedMonster?.healthPoints ?? 0}
        opponentHealth={opponentHealthRef.current ?? 0}
        maxOpponentHealth={monsterStore.opponentMonster?.healthPoints ?? 0}
        chalengerStamina={yourStamina ?? 0}
        maxChalengerStamina={monsterStore.selectedMonster?.stamina ?? 0}
        opponentStamina={opponentStamina ?? 0}
        maxOpponentStamina={monsterStore.opponentMonster?.stamina ?? 0}
        isCurrentTurn={isCurrentTurn}
        turnEndsAtMs={turnEndsAtMs ?? undefined}
        turnTimeLimitMs={turnTimeLimitMs}
        serverNowMs={Date.now() + serverOffsetRef.current}
      />

      <div className={styles.battleCenter}>
        {lastAction && (
          <>
            {lastAction.monsterId === monsterStore.selectedMonster?.id ? (
              <>
                <div className={`${styles.lastActionOverlay} ${styles.opponentOverlay}`}>
                  -{lastAction.damage}HP
                </div>
                <div className={`${styles.lastActionOverlay} ${styles.yourOverlay}`}>
                  +{lastAction.stamina}SP
                </div>
              </>
            ) : (
              <>
                <div className={`${styles.lastActionOverlay} ${styles.yourOverlay}`}>
                  -{lastAction.damage}HP
                </div>
                <div className={`${styles.lastActionOverlay} ${styles.opponentOverlay}`}>
                  +{lastAction.stamina}SP
                </div>
              </>
            )}
          </>
        )}
        <div className={styles.phaserContainerWrapper}>
          <div ref={containerRef} />
        </div>
      </div>

      {!isBattleOver && (
        <BottomBattlteMenu
          myAttacks={myAttacks}
          myDefenses={myDefenses}
          availableSp={yourStamina}
          onConfirm={(a, d) => handleConfirm(a, d)}
        />
      )}
    </>
  )
}
