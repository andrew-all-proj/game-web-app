import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import monsterStore from '../../stores/MonsterStore'
import styles from './TestFight.module.css'
import { getSocket } from '../../api/socket'
import userStore from '../../stores/UserStore'
import { BattleRedis, LastActionLog } from '../../types/BattleRedis'
import { useNavigate } from 'react-router-dom'
import { SpriteAtlas } from '../../types/sprites'
import BattleButton from '../../components/Button/BattleButton'
import StatBar from '../../components/StatBar/StatBar'
import smallEnergyIcon from '../../assets/icon/small-stamina-icon.svg'
import smallHeartIcon from '../../assets/icon/small-hp-icon.svg'
import { ActionStatusEnum } from '../../types/enums/ActionStatusEnum'
import { useSocketEvent } from '../../functions/useSocketEvent'

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
  const [lastAction, setLastAction] = useState<LastActionLog | null>(null)
  const [yourStamina, setYourStamina] = useState(0)
  const [opponentStamina, setOpponentStamina] = useState(0)
  const navigate = useNavigate()

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
    if (!atlas || !spriteUrl || !containerRef.current || !spriteUrlOpponent || !atlasOpponent)
      return

    if (isLoading && !isOpponentReady) {
      const intervalId = setInterval(() => {
        const socket = getSocket()
        if (!socket || !socket.connected || isOpponentReady) {
          clearInterval(intervalId)
          return
        }
        socket.emit('startBattle', {
          battleId,
          monsterId: monsterStore.selectedMonster?.id,
        })
      }, 2000)
      return () => clearInterval(intervalId)
    }
  }, [atlas, spriteUrl, atlasOpponent, spriteUrlOpponent, battleId, isLoading, isOpponentReady])

  useSocketEvent<BattleRedis>('responseBattle', (data) => {
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
      return
    }

    setIsOpponentReady(isChallenger ? data.opponentReady === '1' : data.challengerReady === '1')
    setIsMyTurn(currentMonsterId === data.currentTurnMonsterId)
    setCurrentTurnMonsterId(data.currentTurnMonsterId)

    const now = Date.now()
    const remaining = data.turnTimeLimit - (now - data.turnStartTime)
    setTurnTimer(Math.max(0, Math.floor(remaining / 1000)))
  })

  // Phaser Game
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

  // Атака/действие
  const handleAttack = ({
    actionId,
    actionType,
    energyCost,
  }: {
    actionId: number
    actionType: ActionStatusEnum
    energyCost: number
  }) => {
    if (isLoading || !battleId || !monsterStore.selectedMonster?.id) return
    if (monsterStore.selectedMonster.id !== currentTurnMonsterId) return
    if (energyCost > yourStamina) {
      alert(
        `Недостаточно SP для выполнения действия: у вас ${yourStamina} SP, требуется ${energyCost} SP`,
      )
      return
    }
    const socket = getSocket()
    if (!socket || !socket.connected) return

    socket.emit('attack', {
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
      <div className={styles.statBars}>
        <StatBar
          current={yourHealthRef.current ?? 0}
          max={monsterStore.selectedMonster?.healthPoints ?? 0}
          iconSrc={smallHeartIcon}
          backgroundColor={'white'}
          color={'red'}
        />
        <StatBar
          current={opponentHealthRef.current ?? 0}
          max={monsterStore.selectedMonster?.healthPoints ?? 0}
          iconSrc={smallHeartIcon}
          backgroundColor={'white'}
          color={'red'}
        />
        <StatBar
          current={yourStamina ?? 0}
          max={monsterStore.selectedMonster?.stamina ?? 0}
          iconSrc={smallEnergyIcon}
          backgroundColor={'white'}
          color={'yellow'}
        />
        <StatBar
          current={opponentStamina ?? 0}
          max={monsterStore.opponentMonster?.stamina ?? 0}
          iconSrc={smallEnergyIcon}
          backgroundColor={'white'}
          color={'yellow'}
        />
      </div>
      <div className={styles.phaserContainerWrapper}>
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
        <div ref={containerRef} />
      </div>
      {!isBattleOver && (
        <div className={styles.wrapperButton}>
          {myAttacks.map((attack, idx) => (
            <BattleButton
              key={idx}
              spCost={attack.energyCost}
              name={attack.name}
              modifier={attack.modifier}
              onClick={() =>
                handleAttack({
                  actionId: attack.id,
                  actionType: ActionStatusEnum.ATTACK,
                  energyCost: attack.energyCost,
                })
              }
            />
          ))}
          {myDefenses.map((defense, idx) => (
            <BattleButton
              key={`d-${idx}`}
              spCost={defense.energyCost}
              name={`🛡 ${defense.name}`}
              modifier={defense.modifier}
              onClick={() =>
                handleAttack({
                  actionId: defense.id,
                  actionType: ActionStatusEnum.DEFENSE,
                  energyCost: defense.energyCost,
                })
              }
            />
          ))}
          <BattleButton
            spCost={0}
            name="Пропуск"
            modifier={0}
            onClick={() =>
              handleAttack({
                actionId: -1,
                actionType: ActionStatusEnum.PASS,
                energyCost: 0,
              })
            }
          />
        </div>
      )}
    </div>
  )
}
