import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import monsterStore from '../../stores/MonsterStore'
import styles from './TestFight.module.css'
import { connectSocket } from '../../api/socket'
import userStore from '../../stores/UserStore'
import { BattleRedis } from '../../types/BattleRedis'
import { useNavigate } from 'react-router-dom'
import { SpriteAtlas } from '../../types/sprites'

interface TestFightProps {
  battleId: string
  atlas: SpriteAtlas
  atlasOpponent: SpriteAtlas
  spriteUrlOpponent: string
  spriteUrl: string
}

export default function TestFight({
  battleId,
  atlas,
  atlasOpponent,
  spriteUrl,
  spriteUrlOpponent,
}: TestFightProps) {
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const yourHealthRef = useRef<number>(100)
  const opponentHealthRef = useRef<number>(100)
  const yourHealthBarRef = useRef<HTMLDivElement>(null)
  const opponentHealthBarRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpponentReady, setIsOpponentReady] = useState(false)
  const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null)
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [turnTimer, setTurnTimer] = useState<number>(0)
  const [currentTurnMonsterId, setCurrentTurnMonsterId] = useState<string | null>(null)
  const [isBattleOver, setIsBattleOver] = useState(false)
  const [myAttacks, setMyAttacks] = useState<
    { id: number; name: string; modifier: number; energyCost: number; cooldown: number }[]
  >([])
  const [myDefenses, setMyDefenses] = useState<
    { id: number; name: string; modifier: number; energyCost: number; cooldown: number }[]
  >([])
  const [lastAction, setLastAction] = useState('')
  const [yourStamina, setYourStamina] = useState(0)
  const [opponentStamina, setOpponentStamina] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading) return
    ;(async () => {
      if (!monsterStore.selectedMonster || !monsterStore.opponentMonster) return

      if (!userStore.user?.token) return

      const socket = connectSocket(userStore.user.token, () => {
        socketRef.current = socket

        socket.emit('getBattle', {
          battleId,
          monsterId: monsterStore.selectedMonster?.id,
        })

        if (isLoading) {
          socket.emit('startBattle', {
            battleId,
            monsterId: monsterStore.selectedMonster?.id,
          })
        }

        socket.on('responseBattle', (data: BattleRedis) => {
          const currentMonsterId = monsterStore.selectedMonster?.id
          if (!currentMonsterId) return

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
            return
          }

          const isChallenger = currentMonsterId === data.challengerMonsterId

          if (isChallenger) {
            setMyAttacks(data.challengerAttacks || [])
            setMyDefenses(data.challengerDefenses || [])
          } else {
            setMyAttacks(data.opponentAttacks || [])
            setMyDefenses(data.opponentDefenses || [])
          }

          setLastAction(data.lastActionLog || '')

          yourHealthRef.current = isChallenger ? data.challengerMonsterHp : data.opponentMonsterHp
          opponentHealthRef.current = isChallenger
            ? data.opponentMonsterHp
            : data.challengerMonsterHp

          const yourSt = isChallenger ? data.challengerMonsterStamina : data.opponentMonsterStamina
          const opponentSt = isChallenger
            ? data.opponentMonsterStamina
            : data.challengerMonsterStamina

          setYourStamina(yourSt)
          setOpponentStamina(opponentSt)

          if (yourHealthBarRef.current)
            yourHealthBarRef.current.style.width = `${yourHealthRef.current}%`
          if (opponentHealthBarRef.current)
            opponentHealthBarRef.current.style.width = `${opponentHealthRef.current}%`

          setIsOpponentReady(
            isChallenger ? data.opponentReady === '1' : data.challengerReady === '1',
          )
          setIsMyTurn(currentMonsterId === data.currentTurnMonsterId)
          setCurrentTurnMonsterId(data.currentTurnMonsterId)

          const now = Date.now()
          const remaining = data.turnTimeLimit - (now - data.turnStartTime)
          setTurnTimer(Math.max(0, Math.floor(remaining / 1000)))

          const timerInterval = setInterval(() => {
            setTurnTimer((prev) => {
              if (prev <= 1) {
                clearInterval(timerInterval)
                return 0
              }
              return prev - 1
            })
          }, 1000)
        })
      })
    })()
  }, [battleId, isLoading, navigate])

  useEffect(() => {
    //if reloading page setStartBattle
    if (!atlas || !spriteUrl || !containerRef.current || !spriteUrlOpponent || !atlasOpponent)
      return
    if (!isLoading) {
      if (socketRef.current) {
        socketRef.current.emit('startBattle', {
          battleId: battleId,
          monsterId: monsterStore.selectedMonster?.id,
        })
      }
    }
  }, [atlas, spriteUrl, atlasOpponent, spriteUrlOpponent, battleId, isLoading])

  useEffect(() => {
    if (!atlas || !spriteUrl || !containerRef.current || !spriteUrlOpponent || !atlasOpponent)
      return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS,
      width: 400,
      height: 300,
      parent: containerRef.current,
      transparent: true,
      scene: {
        preload,
        create,
        update,
      },
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
    }

    function update(this: Phaser.Scene) {
      //TODO DELETE!!!!!!!!!!!!
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

  const handleAttack = ({
    actionId,
    actionType,
  }: {
    actionId: number
    actionType: 'attack' | 'defense' | 'pass'
  }) => {
    if (isLoading || !battleId || !monsterStore.selectedMonster?.id || !socketRef.current) return

    if (monsterStore.selectedMonster.id !== currentTurnMonsterId) return

    socketRef.current.emit('attack', {
      battleId,
      actionId,
      actionType,
      monsterId: monsterStore.selectedMonster.id,
    })

    if (gameRef.current) {
      const scene = gameRef.current.scene.scenes[0]
      const yourMonsterSprite = scene.children.getByName('yourMonster') as Phaser.GameObjects.Sprite
      const hitOverlay = scene.children.getByName('hitOverlay') as Phaser.GameObjects.Ellipse

      if (yourMonsterSprite) {
        yourMonsterSprite.play('monster_hit')
        scene.time.delayedCall(1000, () => {
          yourMonsterSprite.play('monster_stay')
        })
      }

      if (hitOverlay) {
        hitOverlay.setVisible(true)
        scene.time.delayedCall(500, () => {
          hitOverlay.setVisible(false)
        })
      }
    }
  }

  return (
    <div className={styles.main}>
      {!isMyTurn ? (
        <div style={{ color: 'white', marginBottom: '10px' }}>
          ⏳ Ждите хода соперника... {turnTimer} сек.
        </div>
      ) : (
        <div style={{ color: 'lightgreen', marginBottom: '10px', fontWeight: 'bold' }}>
          ✅ Ваш ход! {turnTimer} сек.
        </div>
      )}
      {!isOpponentReady && (
        <div style={{ color: 'white', marginBottom: '10px' }}>
          🕐 Ожидание готовности соперника...
        </div>
      )}
      <div style={{ color: 'white', marginBottom: '10px' }}>Деиствие: {lastAction}</div>
      <div style={{ color: 'white', marginBottom: '10px' }}>
        {' '}
        Ваш: {yourHealthRef.current} HP _______ Против: {opponentHealthRef.current} HP
      </div>
      <div style={{ color: 'white', marginBottom: '10px' }}>
        {' '}
        Ваш: {yourStamina} SP _______ Против: {opponentStamina} SP
      </div>
      <div style={{ marginTop: '70px', position: 'relative', width: 400, height: 300 }}>
        {/* Your HP bar */}
        <div className={styles.healthBar} style={{ top: 10, left: 20 }}>
          <div
            className={styles.healthFill}
            style={{ width: `${yourHealthRef.current}%`, backgroundColor: '#4caf50' }}
          />
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 25,
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          ></div>
        </div>

        {/* Opponent HP bar */}
        <div className={styles.healthBar} style={{ top: 10, right: 20 }}>
          <div
            className={styles.healthFill}
            style={{ width: `${opponentHealthRef.current}%`, backgroundColor: '#f44336' }}
          />
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 25,
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          ></div>
        </div>

        <div ref={containerRef} />
      </div>

      {!isBattleOver && (
        <div className={styles.wrapperButton}>
          {myAttacks.map((attack, idx) => (
            <button
              key={idx}
              className={styles.attackButton}
              onClick={() => handleAttack({ actionId: attack.id, actionType: 'attack' })}
              disabled={!isMyTurn || !isOpponentReady}
            >
              {attack.name} ({attack.modifier})
            </button>
          ))}

          {myDefenses.map((defense, idx) => (
            <button
              key={`d-${idx}`}
              className={styles.attackButton}
              onClick={() => handleAttack({ actionId: defense.id, actionType: 'defense' })}
              disabled={!isMyTurn || !isOpponentReady}
            >
              🛡 {defense.name} ({defense.modifier})
            </button>
          ))}
          <button
            className={styles.attackButton}
            onClick={() => handleAttack({ actionId: -1, actionType: 'pass' })}
            disabled={!isMyTurn || !isOpponentReady}
          >
          Пропустить ход
          </button>
        </div>
      )}
    </div>
  )
}
