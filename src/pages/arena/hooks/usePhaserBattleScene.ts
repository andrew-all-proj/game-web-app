import { useCallback, useEffect, useRef, type RefObject } from 'react'
import Phaser from 'phaser'
import { SpriteAtlas } from '../../../types/sprites'
import bamAnim from '../../../assets/images/bam-animation.png'
import powAnim from '../../../assets/images/pow-animation.png'

type Params = {
  atlas?: SpriteAtlas | null
  atlasOpponent?: SpriteAtlas | null
  spriteUrl?: string | null
  spriteUrlOpponent?: string | null
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  yourHealthRef: RefObject<number>
  opponentHealthRef: RefObject<number>
  youLabel?: string
  opponentLabel?: string
  width?: number
  height?: number
  scale?: number
  opponentScale?: number
}

export function usePhaserBattleScene({
  atlas,
  atlasOpponent,
  spriteUrl,
  spriteUrlOpponent,
  setIsLoading,
  yourHealthRef,
  opponentHealthRef,
  youLabel = 'Вы',
  opponentLabel = 'Соперник',
  width = 400,
  height = 300,
  scale = 0.7,
  opponentScale = 0.6,
}: Params) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  const apiRef = useRef<{
    animateYourHit: () => void
    animateOpponentHit: () => void
    showGameOver: (win: boolean) => void
  }>({
    animateYourHit: () => {},
    animateOpponentHit: () => {},
    showGameOver: () => {},
  })

  useEffect(() => {
    if (!containerRef.current) return
    if (!atlas || !atlasOpponent || !spriteUrl || !spriteUrlOpponent) return

    const DEPTH = { BG: 0, OPPONENT: 100, YOU: 200, FX: 300, UI: 1000 }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS,
      parent: containerRef.current,
      transparent: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width,
        height,
      },
      scene: { preload, create, update },
    }

    // ссылки на объекты
    let yourMonster: Phaser.GameObjects.Sprite
    let opponentMonster: Phaser.GameObjects.Sprite
    let hitOverlayOpp: Phaser.GameObjects.Ellipse
    let hitOverlayYou: Phaser.GameObjects.Ellipse
    let yourShadow: Phaser.GameObjects.Image
    let oppShadow: Phaser.GameObjects.Image
    let bamCenter: Phaser.GameObjects.Image
    let powCenter: Phaser.GameObjects.Image

    // слои
    let layerBG: Phaser.GameObjects.Layer
    let layerOpp: Phaser.GameObjects.Layer
    let layerYou: Phaser.GameObjects.Layer
    let layerFX: Phaser.GameObjects.Layer
    let layerUI: Phaser.GameObjects.Layer

    function preload(this: Phaser.Scene) {
      const loadingText = this.add
        .text(width / 2, height / 2, 'Loading... 0%', { fontSize: '20px', color: '#ffffff' })
        .setOrigin(0.5)

      this.load.on('progress', (value: number) => {
        loadingText.setText(`Loading... ${Math.floor(value * 100)}%`)
        if (value > 0.5) {
          setIsLoading(false)
        }
      })
      this.load.on('complete', () => {
        loadingText.destroy()
      })
      this.load.on('loaderror', (file: Phaser.Loader.File) => {
        loadingText.setText(`Error loading: ${file.key}`)
      })

      this.load.atlas('monster', spriteUrl!, atlas!)
      this.load.atlas('opponent', spriteUrlOpponent!, atlasOpponent!)
      this.load.image('bam', bamAnim)
      this.load.image('pow', powAnim)

      // текстура тени (генерим один раз, без добавления на сцену)
      if (!this.textures.exists('shadowCircle')) {
        const g = this.make.graphics({ x: 0, y: 0 })
        g.fillStyle(0x000000, 0.28)
        g.fillEllipse(64, 32, 128, 64) // 128x64, центр в (64,32)
        g.generateTexture('shadowCircle', 128, 64)
        g.destroy()
      }
    }

    function create(this: Phaser.Scene) {
      // слои
      layerBG = this.add.layer().setDepth(DEPTH.BG).setName('layerBG')
      layerOpp = this.add.layer().setDepth(DEPTH.OPPONENT).setName('layerOpp')
      layerYou = this.add.layer().setDepth(DEPTH.YOU).setName('layerYou')
      layerFX = this.add.layer().setDepth(DEPTH.FX).setName('layerFX')
      layerUI = this.add.layer().setDepth(DEPTH.UI).setName('layerUI')

      // СПРАЙТЫ: originY = 1 → y = «линия ног»
      yourMonster = this.add
        .sprite(width * 0.25, height * 0.75, 'monster', Object.keys(atlas!.frames)[0])
        .setOrigin(0.5, 0.86)
        .setScale(scale)
        .setName('yourMonster')

      opponentMonster = this.add
        .sprite(width * 0.75, height * 0.6, 'opponent', Object.keys(atlasOpponent!.frames)[0])
        .setOrigin(0.5, 0.86)
        .setFlipX(true) // зеркалим противника
        .setScale(opponentScale)
        .setName('opponentMonster')

      layerYou.add(yourMonster)
      layerOpp.add(opponentMonster)

      // ТЕНИ: под ногами (y + 2), под спрайтами в своём слое
      yourShadow = this.add
        .image(yourMonster.x, yourMonster.y + 2, 'shadowCircle')
        .setOrigin(0.5, 0)
        .setAlpha(0.35)
        .setName('yourShadow')
      oppShadow = this.add
        .image(opponentMonster.x, opponentMonster.y + 2, 'shadowCircle')
        .setOrigin(0.5, 0)
        .setAlpha(0.35)
        .setName('oppShadow')

      layerYou.add(yourShadow)
      layerOpp.add(oppShadow)
      layerYou.moveTo(yourShadow, 0) // низ слоя → под спрайтом
      layerOpp.moveTo(oppShadow, 0)

      // АНИМАЦИИ
      this.anims.create({
        key: 'monster_stay',
        frames: this.anims.generateFrameNames('monster', {
          prefix: 'stay_',
          start: 0,
          end: Object.keys(atlas!.frames).filter((k) => k.startsWith('stay_')).length - 1,
        }),
        frameRate: 5,
        repeat: -1,
      })
      this.anims.create({
        key: 'opponent_stay',
        frames: this.anims.generateFrameNames('opponent', {
          prefix: 'stay_',
          start: 0,
          end: Object.keys(atlasOpponent!.frames).filter((k) => k.startsWith('stay_')).length - 1,
        }),
        frameRate: 5,
        repeat: -1,
      })
      this.anims.create({
        key: 'monster_hit',
        frames: this.anims.generateFrameNames('monster', {
          prefix: 'hit_',
          start: 0,
          end: Object.keys(atlas!.frames).filter((k) => k.startsWith('hit_')).length - 1,
        }),
        frameRate: 8,
        repeat: -1,
      })
      this.anims.create({
        key: 'opponent_hit',
        frames: this.anims.generateFrameNames('opponent', {
          prefix: 'hit_',
          start: 0,
          end: Object.keys(atlasOpponent!.frames).filter((k) => k.startsWith('hit_')).length - 1,
        }),
        frameRate: 8,
        repeat: -1,
      })

      const cx = this.cameras.main.centerX
      const cy = this.cameras.main.centerY

      bamCenter = this.add
        .image(cx, cy, 'bam')
        .setOrigin(0.5)
        .setAlpha(0) // скрыт по умолчанию
        .setScale(0.9)
        .setName('bamCenter')

      layerFX.add(bamCenter)

      powCenter = this.add
        .image(cx, cy, 'pow')
        .setOrigin(0.5)
        .setAlpha(0) // скрыт по умолчанию
        .setScale(0.9)
        .setName('powCenter')

      layerFX.add(powCenter)

      // FX-оверлеи: центр по корпусу (середина от ног)
      hitOverlayOpp = this.add
        .ellipse(
          opponentMonster.x,
          opponentMonster.y - opponentMonster.displayHeight * 0.5,
          200,
          200,
          0xff0000,
          0.4,
        )
        .setVisible(false)
        .setName('hitOverlayOpp')
      hitOverlayYou = this.add
        .ellipse(
          yourMonster.x,
          yourMonster.y - yourMonster.displayHeight * 0.5,
          200,
          200,
          0xff0000,
          0.4,
        )
        .setVisible(false)
        .setName('hitOverlayYou')
      layerFX.add([hitOverlayOpp, hitOverlayYou])

      // Фоновые частицы
      if (!this.textures.exists('raindrop')) {
        const g = this.make.graphics({ x: 0, y: 0 })
        g.fillStyle(0xffffff, 0.2)
        g.fillRect(0, 0, 2, 12)
        g.generateTexture('raindrop', 2, 12)
        g.destroy()
      }
      const rain = this.add.particles(0, 0, 'raindrop', {
        x: { min: 0, max: width },
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
      layerBG.add(rain)

      yourMonster.play('monster_stay')
      opponentMonster.play('opponent_stay')

      // API
      apiRef.current.animateYourHit = () => {
        yourMonster.play('monster_hit')
        this.time.delayedCall(1000, () => yourMonster.play('monster_stay'))

        // (опционально) лёгкий flash-оверлей
        hitOverlayOpp.setVisible(true)
        this.time.delayedCall(120, () => hitOverlayOpp.setVisible(false))

        // BAM по центру сцены
        const { centerX: cx, centerY: cy } = this.cameras.main
        this.tweens.killTweensOf(bamCenter)
        bamCenter.setPosition(cx, cy).setVisible(true).setAlpha(1).setScale(0.9)

        this.tweens.add({
          targets: bamCenter,
          alpha: 1,
          scale: 1.9,
          duration: 250,
          ease: 'Back.Out',
          onComplete: () => {
            this.tweens.add({
              targets: bamCenter,
              alpha: 0,
              scale: 0.9,
              duration: 350,
              ease: 'Quad.Out',
              onComplete: () => bamCenter.setVisible(false),
            })
          },
        })
      }

      apiRef.current.animateOpponentHit = () => {
        opponentMonster.play('opponent_hit')
        this.time.delayedCall(1000, () => opponentMonster.play('opponent_stay'))

        // лёгкий flash по игроку
        hitOverlayYou.setVisible(true)
        this.time.delayedCall(120, () => hitOverlayYou.setVisible(false))

        // --- гарантированно выключаем BAM, чтобы он не мешал POW ---
        this.tweens.killTweensOf(bamCenter)
        bamCenter.setVisible(false).setAlpha(0)

        // POW по центру сцены
        const { centerX: cx, centerY: cy } = this.cameras.main
        this.tweens.killTweensOf(powCenter)
        powCenter.setPosition(cx, cy).setVisible(true).setAlpha(1).setScale(0.9)

        // на всякий — поднимаем POW поверх всего в FX-слое
        layerFX.bringToTop(powCenter)

        this.tweens.add({
          targets: powCenter,
          alpha: 1,
          scale: 1.9,
          duration: 160,
          ease: 'Back.Out',
          onComplete: () => {
            this.tweens.add({
              targets: powCenter,
              alpha: 0,
              scale: 0.9,
              duration: 350,
              ease: 'Quad.Out',
              onComplete: () => powCenter.setVisible(false),
            })
          },
        })
      }

      apiRef.current.showGameOver = (win: boolean) => {
        if (!this.children.getByName('gameOverText')) {
          const t = this.add
            .text(width / 2, 40, win ? 'YOU WIN' : 'YOU LOSE', {
              fontSize: '32px',
              color: win ? '#00ff00' : '#ff0000',
              fontStyle: 'bold',
            })
            .setOrigin(0.5)
            .setName('gameOverText')
          layerUI.add(t)
        }
      }
    }

    function update(this: Phaser.Scene) {
      // тени под ногами (originY = 1 → y = линия ног)
      yourShadow.setPosition(yourMonster.x, yourMonster.y + 2)
      oppShadow.setPosition(opponentMonster.x, opponentMonster.y + 2)

      // ширина тени от ширины спрайта; по Y приплюснута
      const baseW = 128
      const sxYou = (yourMonster.displayWidth * 0.8) / baseW
      const sxOpp = (opponentMonster.displayWidth * 0.8) / baseW
      yourShadow.setScale(sxYou, sxYou * 0.45)
      oppShadow.setScale(sxOpp, sxOpp * 0.45)

      // оверлеи по центру корпуса
      hitOverlayYou.setPosition(yourMonster.x, yourMonster.y - yourMonster.displayHeight * 0.5)
      hitOverlayOpp.setPosition(
        opponentMonster.x,
        opponentMonster.y - opponentMonster.displayHeight * 0.5,
      )
    }

    if (gameRef.current) {
      gameRef.current.destroy(true)
      gameRef.current = null
    }
    gameRef.current = new Phaser.Game(config)

    const api = apiRef.current
    const game = gameRef.current

    return () => {
      api.animateYourHit = () => {}
      api.animateOpponentHit = () => {}
      api.showGameOver = () => {}
      game?.destroy(true)
      gameRef.current = null
    }
  }, [
    atlas,
    atlasOpponent,
    spriteUrl,
    spriteUrlOpponent,
    setIsLoading,
    youLabel,
    opponentLabel,
    width,
    height,
    scale,
    opponentScale,
    yourHealthRef,
    opponentHealthRef,
  ])

  const animateYourHit = useCallback(() => apiRef.current.animateYourHit(), [])
  const animateOpponentHit = useCallback(() => apiRef.current.animateOpponentHit(), [])
  const showGameOver = useCallback((win: boolean) => apiRef.current.showGameOver(win), [])

  return { containerRef, animateYourHit, animateOpponentHit, showGameOver }
}
