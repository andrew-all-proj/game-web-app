import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import monsterStore from '../../stores/MonsterStore'
import styles from './TestFight.module.css'
import { getSocket } from '../../api/socket'
import userStore from '../../stores/UserStore'
import { BattleRedis, GetBattleReward, LastActionLog } from '../../types/BattleRedis'
import { useNavigate } from 'react-router-dom'
import { SpriteAtlas } from '../../types/sprites'
import { ActionStatusEnum } from '../../types/enums/ActionStatusEnum'
import { useSocketEvent } from '../../functions/useSocketEvent'
import { Skill } from '../../types/GraphResponse'
import HeaderBattle from './HeaderBattle'
import BottomBattlteMenu from './BottomBattlteMenu'
import { showTopAlert } from '../../components/TopAlert/topAlertBus'

const DEFAULT_TURN_LIMIT = 30_000
const CHECK_BATTLE_LIMIT = 60_000

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
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const yourHealthRef = useRef<number>(100)
  const opponentHealthRef = useRef<number>(100)
  const yourHealthBarRef = useRef<HTMLDivElement>(null)
  const opponentHealthBarRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpponentReady, setIsOpponentReady] = useState(false)
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

  // Init/connect socket and start battle
  useEffect(() => {
    if (!isLoading) return
    ;(async () => {
      if (!monsterStore.selectedMonster || !monsterStore.opponentMonster) return
      if (!userStore.user?.token) return

      const socket = getSocket()
      if (!socket) {
        return
      }

      socket.emit('getBattle', {
        battleId,
        monsterId: monsterStore.selectedMonster?.id,
      })

      socket.emit('startBattle', {
        battleId,
        monsterId: monsterStore.selectedMonster?.id,
      })
    })()
  }, [battleId, isLoading, navigate])

  useEffect(() => {
    if (!atlas || !spriteUrl || !spriteUrlOpponent || !atlasOpponent) return
    if (!battleId || !monsterStore.selectedMonster?.id) return

    if (isOpponentReady) return

    const socket = getSocket()
    if (!socket) return

    //Check opponet every 60 sec
    const id = setInterval(() => {
      if (!socket.connected) return
      if (isOpponentReady) return
      socket.emit('startBattle', {
        battleId,
        monsterId: monsterStore.selectedMonster!.id,
      })
    }, CHECK_BATTLE_LIMIT)

    socket.emit('startBattle', {
      battleId,
      monsterId: monsterStore.selectedMonster!.id,
    })

    return () => clearInterval(id)
  }, [battleId, atlas, atlasOpponent, spriteUrl, spriteUrlOpponent, isOpponentReady])

  useEffect(() => {
    if (!battleId || !monsterStore.selectedMonster?.id) return
    const socket = getSocket()
    if (!socket) return

    const check = () => {
      const silentMs = Date.now() - lastServerEventRef.current
      if (silentMs >= CHECK_BATTLE_LIMIT && socket.connected) {
        socket.emit('getBattle', {
          battleId,
          monsterId: monsterStore.selectedMonster!.id,
        })
        // чтобы не стрелять каждые 10с, если сервер молчит, обновим отметку
        lastServerEventRef.current = Date.now()
      }
    }

    const id = setInterval(check, 10_000) // проверяем каждые 10 секунд
    document.addEventListener('visibilitychange', check) // вернулись во вкладку — тоже проверим

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', check)
    }
  }, [battleId, monsterStore.selectedMonster?.id])

  useSocketEvent<BattleRedis>('responseBattle', (data) => {
    if (data.rejected) {
      showTopAlert({open: true, variant: 'error', text: 'Ошибка боя, бой отменен'})
      navigate('/search-battle')
    }
    lastServerEventRef.current = Date.now()
    const currentMonsterId = monsterStore.selectedMonster?.id
    if (!currentMonsterId) return

    const isChallenger = currentMonsterId === data.challengerMonsterId

    if (isChallenger) {
      setMyAttacks(data.challengerAttacks || [])
      setMyDefenses(data.challengerDefenses || [])
    } else {
      setMyAttacks(data.opponentAttacks || [])
      setMyDefenses(data.opponentDefenses || [])
    }

    setLastAction(data.lastActionLog ?? null)

    yourHealthRef.current = isChallenger ? data.challengerMonsterHp : data.opponentMonsterHp
    opponentHealthRef.current = isChallenger ? data.opponentMonsterHp : data.challengerMonsterHp

    const yourSt = isChallenger ? data.challengerMonsterStamina : data.opponentMonsterStamina
    const opponentSt = isChallenger ? data.opponentMonsterStamina : data.challengerMonsterStamina

    setYourStamina(yourSt)
    setOpponentStamina(opponentSt)

    if (yourHealthBarRef.current) yourHealthBarRef.current.style.width = `${yourHealthRef.current}%`
    if (opponentHealthBarRef.current)
      opponentHealthBarRef.current.style.width = `${opponentHealthRef.current}%`

    if (data.winnerMonsterId) {
      setIsBattleOver(true)

      const isWin = monsterStore.selectedMonster?.id === data.winnerMonsterId
      const scene = gameRef.current?.scene.scenes[0]
      if (scene && !scene.children.getByName('gameOverText')) {
        scene.add
          .text(200, 40, isWin ? 'YOU WIN' : 'YOU LOSE', {
            fontSize: '32px',
            color: isWin ? '#00ff00' : '#ff0000',
            fontStyle: 'bold',
          })
          .setOrigin(0.5)
          .setName('gameOverText')
      }

      const reward = isChallenger ? data.challengerGetReward : data.opponentGetReward

      setBattleResult({
        win: isWin,
        reward: reward || null,
      })
    }

    setIsOpponentReady(isChallenger ? data.opponentReady === true : data.challengerReady === true)
    setIsCurrentTurn(currentMonsterId === data.currentTurnMonsterId)
    setCurrentTurnMonsterId(data.currentTurnMonsterId)

    const serverNowMs = data.serverNowMs
    if (serverNowMs && Math.abs(serverNowMs - Date.now()) < 10 * 60 * 1000) {
      serverOffsetRef.current = serverNowMs - Date.now()
    }

    setTurnEndsAtMs(data.turnEndsAtMs)
    setTurnTimeLimitMs(data.turnTimeLimit ?? DEFAULT_TURN_LIMIT)
  })

  useEffect(() => {
    if (!isCurrentTurn || !turnEndsAtMs) {
      autoSkipRef.current = null
      return
    }

    let raf = 0
    const tick = () => {
      const now = Date.now() + serverOffsetRef.current
      if (
        now >= turnEndsAtMs &&
        monsterStore.selectedMonster?.id === currentTurnMonsterId &&
        autoSkipRef.current !== turnEndsAtMs
      ) {
        autoSkipRef.current = turnEndsAtMs
        const socket = getSocket()
        if (socket?.connected) {
          socket.emit('attack', {
            battleId,
            actionId: null,
            actionType: ActionStatusEnum.PASS,
            monsterId: monsterStore.selectedMonster.id,
          })
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isCurrentTurn, turnEndsAtMs, currentTurnMonsterId, battleId])

  // Phaser Game
  useEffect(() => {
    if (!atlas || !spriteUrl || !containerRef.current || !spriteUrlOpponent || !atlasOpponent)
      return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS,
      parent: containerRef.current!,
      transparent: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 300,
      },
      scene: { preload, create, update },
    }

    let yourMonster: Phaser.GameObjects.Sprite
    let opponentMonsterSprite: Phaser.GameObjects.Sprite

    function preload(this: Phaser.Scene) {
      if (!atlas || !atlasOpponent) return
      const loadingText = this.add
        .text(200, 150, 'Loading... 0%', {
          fontSize: '20px',
          color: '#ffffff',
        })
        .setOrigin(0.5)

      this.load.on('progress', (value: number) => {
        const percent = Math.floor(value * 100)
        loadingText.setText(`Loading... ${percent}%`)
      })

      this.load.on('complete', () => {
        loadingText.destroy()
        setIsLoading(false)
      })

      this.load.on('loaderror', (file: Phaser.Loader.File) => {
        loadingText.setText(`Error loading: ${file.key}`)
      })

      this.load.atlas('monster', spriteUrl, atlas)
      this.load.atlas('opponent', spriteUrlOpponent, atlasOpponent)
    }

    const scale = 0.12

    function create(this: Phaser.Scene) {
      if (!atlas || !atlasOpponent) return
      yourMonster = this.add
        .sprite(100, 150, 'monster', Object.keys(atlas.frames)[0])
        .setScale(scale)
        .setName('yourMonster')

      opponentMonsterSprite = this.add
        .sprite(300, 150, 'opponent', Object.keys(atlasOpponent.frames)[0])
        .setScale(-scale, scale)
        .setName('opponentMonster')

      this.add
        .text(yourMonster.x, yourMonster.y - 90, monsterStore.selectedMonster?.name || 'Вы', {
          fontSize: '14px',
          color: '#ffffff',
        })
        .setOrigin(0.5)

      this.add
        .text(
          opponentMonsterSprite.x,
          opponentMonsterSprite.y - 90,
          monsterStore.opponentMonster?.name || 'Соперник',
          {
            fontSize: '14px',
            color: '#ffffff',
          },
        )
        .setOrigin(0.5)

      this.anims.create({
        key: 'monster_stay',
        frames: this.anims.generateFrameNames('monster', {
          prefix: 'stay_',
          start: 0,
          end: Object.keys(atlas.frames).filter((k) => k.startsWith('stay_')).length - 1,
        }),
        frameRate: 5,
        repeat: -1,
      })

      this.anims.create({
        key: 'opponent_stay',
        frames: this.anims.generateFrameNames('opponent', {
          prefix: 'stay_',
          start: 0,
          end: Object.keys(atlasOpponent.frames).filter((k) => k.startsWith('stay_')).length - 1,
        }),
        frameRate: 5,
        repeat: -1,
      })

      this.anims.create({
        key: 'monster_hit',
        frames: this.anims.generateFrameNames('monster', {
          prefix: 'hit_',
          start: 0,
          end: Object.keys(atlas.frames).filter((k) => k.startsWith('hit_')).length - 1,
        }),
        frameRate: 8,
        repeat: -1,
      })

      this.anims.create({
        key: 'opponent_hit',
        frames: this.anims.generateFrameNames('opponent', {
          prefix: 'hit_',
          start: 0,
          end: Object.keys(atlasOpponent.frames).filter((k) => k.startsWith('hit_')).length - 1,
        }),
        frameRate: 8,
        repeat: -1,
      })

      const hitOverlay = this.add.ellipse(300, 150, 200, 200, 0xff0000, 0.4)
      hitOverlay.setVisible(false)
      hitOverlay.setName('hitOverlay')

      const hitOverlayMy = this.add.ellipse(100, 150, 200, 200, 0xff0000, 0.4)
      hitOverlayMy.setVisible(false)
      hitOverlayMy.setName('hitOverlayMy')

      yourMonster.play('monster_stay')
      opponentMonsterSprite.play('opponent_stay')

      if (!this.textures.exists('raindrop')) {
        const graphics = this.make.graphics({ x: 0, y: 0 })
        graphics.fillStyle(0xffffff, 0.2)
        graphics.fillRect(0, 0, 2, 12)
        graphics.generateTexture('raindrop', 2, 12)
        graphics.destroy()
      }

      this.add.particles(0, 0, 'raindrop', {
        x: { min: 0, max: 400 },
        y: 0,
        lifespan: 1200,
        speedY: { min: 250, max: 320 },
        scale: { start: 1, end: 0.3 },
        quantity: 4,
        frequency: 40,
        alpha: { start: 0.5, end: 0 },
        angle: { min: 85, max: 95 },
        blendMode: 'ADD',
      })
    }

    function update(this: Phaser.Scene) {
      if (opponentHealthRef.current <= 0) {
        opponentMonsterSprite.angle = 90
      }
      if (yourHealthRef.current <= 0) {
        yourMonster.angle = -90
      }
    }

    if (gameRef.current) {
      gameRef.current.destroy(true)
    }
    gameRef.current = new Phaser.Game(config)

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [atlas, spriteUrl, atlasOpponent, spriteUrlOpponent])

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

    // Оба id в одном эмите; если оба null — сервер трактует как PASS
    socket.emit('attack', {
      battleId,
      monsterId: monsterStore.selectedMonster.id,
      attackId, // string | null
      defenseId, // string | null
    })

    // Анимация удара показывается только если выбрана атака
    if (gameRef.current && attackId) {
      const scene = gameRef.current.scene.scenes[0]
      const yourMonsterSprite = scene.children.getByName('yourMonster') as Phaser.GameObjects.Sprite
      const hitOverlay = scene.children.getByName('hitOverlay') as Phaser.GameObjects.Ellipse

      if (yourMonsterSprite) {
        yourMonsterSprite.play('monster_hit')
        scene.time.delayedCall(1000, () => yourMonsterSprite.play('monster_stay'))
      }
      if (hitOverlay) {
        hitOverlay.setVisible(true)
        scene.time.delayedCall(500, () => hitOverlay.setVisible(false))
      }
    }
  }

  useLayoutEffect(() => {
    const setVars = () => {
      const header = document.querySelector('#battle-header') // дай этому контейнеру id
      const menu = document.querySelector('#bottom-menu') // и этому тоже
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
        {!isOpponentReady && (
          <div style={{ color: 'white', marginBottom: 10 }}>
            🕐 Ожидание готовности соперника...
          </div>
        )}
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
