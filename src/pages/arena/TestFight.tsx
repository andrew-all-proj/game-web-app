import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import monsterStore from '../../stores/MonsterStore'
import styles from './TestFight.module.css'
import { FileItem, Monster } from '../../types/GraphResponse'

const getSprite = async (
  monster?: Monster,
): Promise<{ atlasFile: FileItem | null; spriteFile: FileItem | null }> => {
  if (!monster) return { atlasFile: null, spriteFile: null }

  let atlasFile =
    monster.files?.find((f) => f.fileType === 'JSON' && f.contentType === 'SPRITE_SHEET_MONSTER') ??
    null
  let spriteFile =
    monster.files?.find(
      (f) => f.fileType === 'IMAGE' && f.contentType === 'SPRITE_SHEET_MONSTER',
    ) ?? null
  return { atlasFile, spriteFile }
}

export default function TestFight() {
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [yourHealth, setYourHealth] = useState(100)
  const [opponentHealth, setOpponentHealth] = useState(100)
  const [atlas, setAtlas] = useState<any>(null)
  const [spriteUrl, setSpriteUrl] = useState<string>('')
  const [atlasOpponent, setAtlasOpponent] = useState<any>(null)
  const [spriteUrlOpponent, setSpriteUrlOpponent] = useState<string>('')
   const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      if (!monsterStore.selectedMonster || !monsterStore.opponentMonster) return

      // Получение файлов игрока
      const { atlasFile, spriteFile } = await getSprite(monsterStore.selectedMonster)
      if (atlasFile && spriteFile) {
        const atlasJson = await fetch(atlasFile.url).then((res) => res.json())
        setAtlas(atlasJson)
        setSpriteUrl(spriteFile.url)
      }

      // Получение файлов соперника
      const { atlasFile: opponentAtlasFile, spriteFile: opponentSpriteFile } = await getSprite(
        monsterStore.opponentMonster,
      )
      if (opponentAtlasFile && opponentSpriteFile) {
        const atlasJson = await fetch(opponentAtlasFile.url).then((res) => res.json())
        setAtlasOpponent(atlasJson)
        setSpriteUrlOpponent(opponentSpriteFile.url)
      }
    })()
  }, [])

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
        console.log('✅ All assets loaded!')
        loadingText.destroy()
        setIsLoading(false)
      })

      this.load.on('loaderror', (file: Phaser.Loader.File) => {
        console.error(`❌ Failed to load: ${file.key}`, file)
        loadingText.setText(`Error loading: ${file.key}`)
      })

      this.load.atlas('monster', spriteUrl, atlas)
      this.load.atlas('opponent', spriteUrlOpponent, atlasOpponent)
    }

    const scale = 0.12

    function create(this: Phaser.Scene) {
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
      if (opponentHealth <= 0) {
        opponentMonsterSprite.angle = 90

        if (!this.children.getByName('gameOverText')) {
          this.add
            .text(200, 40, 'YOU WIN', {
              fontSize: '32px',
              color: '#00ff00',
              fontStyle: 'bold',
            })
            .setOrigin(0.5)
            .setName('gameOverText')
        }
      }

      if (yourHealth <= 0) {
        yourMonster.angle = -90

        if (!this.children.getByName('gameOverText')) {
          this.add
            .text(200, 40, 'YOU LOSE', {
              fontSize: '32px',
              color: '#ff0000',
              fontStyle: 'bold',
            })
            .setOrigin(0.5)
            .setName('gameOverText')
        }
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
    if(isLoading) return 
    setOpponentHealth((prev) => {
      const newHealth = Math.max(prev - damage, 0)

      if (gameRef.current) {
        const scene = gameRef.current.scene.scenes[0]
        const opponent = scene.children.getByName('opponentMonster') as Phaser.GameObjects.Sprite
        const gameOverText = scene.children.getByName('gameOverText')

        if (newHealth <= 0 && opponent && !gameOverText) {
          opponent.angle = 90
          scene.add
            .text(200, 40, 'YOU WIN', {
              fontSize: '32px',
              color: '#00ff00',
              fontStyle: 'bold',
            })
            .setOrigin(0.5)
            .setName('gameOverText')
        }
      }

      return newHealth
    })

    setYourHealth((prev) => {
      const randomDamage = Math.floor(Math.random() * 26) + 5 // от 5 до 30
      const newHealth = Math.max(prev - randomDamage, 0)

      if (gameRef.current) {
        const scene = gameRef.current.scene.scenes[0]
        const your = scene.children.getByName('yourMonster') as Phaser.GameObjects.Sprite
        const gameOverText = scene.children.getByName('gameOverText')

        if (newHealth <= 0 && your && !gameOverText) {
          your.angle = -90
          scene.add
            .text(200, 40, 'YOU LOSE', {
              fontSize: '32px',
              color: '#ff0000',
              fontStyle: 'bold',
            })
            .setOrigin(0.5)
            .setName('gameOverText')
        }
      }

      return newHealth
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

  if (!monsterStore.selectedMonster) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', color: 'white', fontSize: '34px' }}>
        Выберите монстра в лаборатории
      </div>
    )
  }

  return (
    <div className={styles.main}>
      <div style={{ marginTop: '70px', position: 'relative', width: 400, height: 300 }}>
        <div className={styles.healthBar} style={{ top: 10, left: 20 }}>
          <div
            className={styles.healthFill}
            style={{ width: `${yourHealth}%`, backgroundColor: '#4caf50' }}
          />
        </div>
        <div className={styles.healthBar} style={{ top: 10, right: 20 }}>
          <div
            className={styles.healthFill}
            style={{ width: `${opponentHealth}%`, backgroundColor: '#f44336' }}
          />
        </div>
        <div ref={containerRef} />
      </div>

      <div className={styles.wrapperButton}>
        <button className={styles.attackButton} onClick={() => handleAttack(10)}>
          Укусить
        </button>
        <button className={styles.attackButton} onClick={() => handleAttack(15)}>
          Удар рукой
        </button>
        <button className={styles.attackButton} onClick={() => handleAttack(20)}>
          Удар ногой
        </button>
        <button className={styles.attackButton} onClick={() => handleAttack(25)}>
          Удар хвостом
        </button>
      </div>
    </div>
  )
}
