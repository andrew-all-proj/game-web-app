import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import monsterStore from '../../stores/MonsterStore'
import styles from './TestFight.module.css'
import { FileItem, Monster } from '../../types/GraphResponse'
import { connectSocket } from '../../api/socket'
import userStore from '../../stores/UserStore'
import { BattleRedis } from '../../types/BattleRedis'
import { useNavigate } from 'react-router-dom'
import errorStore from '../../stores/ErrorStore'
import { SpriteAtlas } from '../../types/sprites'

const getSprite = async (
  monster?: Monster,
): Promise<{ atlasFile: FileItem | null; spriteFile: FileItem | null }> => {
  if (!monster) return { atlasFile: null, spriteFile: null }

  const atlasFile =
    monster.files?.find((f) => f.fileType === 'JSON' && f.contentType === 'SPRITE_SHEET_MONSTER') ??
    null

  const spriteFile =
    monster.files?.find(
      (f) => f.fileType === 'IMAGE' && f.contentType === 'SPRITE_SHEET_MONSTER',
    ) ?? null

  return { atlasFile, spriteFile }
}

interface TestFightProps {
  battleId?: string
}

export default function TestFight({ battleId }: TestFightProps) {
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const yourHealthRef = useRef<number>(100)
  const opponentHealthRef = useRef<number>(100)
  const yourHealthBarRef = useRef<HTMLDivElement>(null)
  const opponentHealthBarRef = useRef<HTMLDivElement>(null)
  const [atlas, setAtlas] = useState<SpriteAtlas | null>(null)
  const [atlasOpponent, setAtlasOpponent] = useState<SpriteAtlas | null>(null)
  const [spriteUrl, setSpriteUrl] = useState<string>('')
  const [spriteUrlOpponent, setSpriteUrlOpponent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isOpponentReady, setIsOpponentReady] = useState(false)
  const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null)
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [turnTimer, setTurnTimer] = useState<number>(0)
  const [currentTurnMonsterId, setCurrentTurnMonsterId] = useState<string | null>(null)
  const [isBattleOver, setIsBattleOver] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading) return
    ;(async () => {
      if (!monsterStore.selectedMonster || !monsterStore.opponentMonster) return

      const { atlasFile, spriteFile } = await getSprite(monsterStore.selectedMonster)
      if (atlasFile && spriteFile) {
        const atlasJson = await fetch(atlasFile.url).then((res) => res.json())
        setAtlas(atlasJson)
        setSpriteUrl(spriteFile.url)
      } else {
        errorStore.setError({ error: true, message: 'Ошибка загрузки спрайтов' })
        navigate('/error')
      }

      const { atlasFile: opponentAtlasFile, spriteFile: opponentSpriteFile } = await getSprite(
        monsterStore.opponentMonster,
      )
      if (opponentAtlasFile && opponentSpriteFile) {
        const atlasJson = await fetch(opponentAtlasFile.url).then((res) => res.json())
        setAtlasOpponent(atlasJson)
        setSpriteUrlOpponent(opponentSpriteFile.url)
      } else {
        errorStore.setError({ error: true, message: 'Ошибка загрузки спрайтов соперника' })
        navigate('/error')
      }

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
            return
          }

          const isChallenger = currentMonsterId === data.challengerMonsterId
          yourHealthRef.current = isChallenger ? data.challengerMonsterHp : data.opponentMonsterHp
          opponentHealthRef.current = isChallenger
            ? data.opponentMonsterHp
            : data.challengerMonsterHp

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

  const handleAttack = (damage: number) => {
    if (isLoading || !battleId || !monsterStore.selectedMonster?.id || !socketRef.current) return

    if (monsterStore.selectedMonster.id !== currentTurnMonsterId) return

    socketRef.current.emit('attack', {
      battleId,
      damage,
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
      <div style={{ marginTop: '70px', position: 'relative', width: 400, height: 300 }}>
        <div className={styles.healthBar} style={{ top: 10, left: 20 }}>
          <div
            className={styles.healthFill}
            style={{ width: `${yourHealthRef.current}%`, backgroundColor: '#4caf50' }}
          />
        </div>
        <div className={styles.healthBar} style={{ top: 10, right: 20 }}>
          <div
            className={styles.healthFill}
            style={{ width: `${opponentHealthRef.current}%`, backgroundColor: '#f44336' }}
          />
        </div>
        <div ref={containerRef} />
      </div>

      {!isBattleOver && (
        <div className={styles.wrapperButton}>
          <button
            className={styles.attackButton}
            onClick={() => handleAttack(10)}
            disabled={!isMyTurn || !isOpponentReady}
          >
            Укусить
          </button>
          <button
            className={styles.attackButton}
            onClick={() => handleAttack(15)}
            disabled={!isMyTurn || !isOpponentReady}
          >
            Удар рукой
          </button>
          <button
            className={styles.attackButton}
            onClick={() => handleAttack(20)}
            disabled={!isMyTurn || !isOpponentReady}
          >
            Удар ногой
          </button>
          <button
            className={styles.attackButton}
            onClick={() => handleAttack(25)}
            disabled={!isMyTurn || !isOpponentReady}
          >
            Удар хвостом
          </button>
        </div>
      )}
    </div>
  )
}
