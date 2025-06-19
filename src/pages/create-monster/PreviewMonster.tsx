import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import { PartPreviews } from './CreateMonster'
import { SpriteAtlas } from '../../types/sprites'
import DebugLogPanel, { DebugLogHandle } from '../../components/DebugLogHandle/DebugLogHandle'

interface SelectedPartInfo {
  key: string
  attachPoint: { x: number; y: number }
  frameSize?: { x: number; y: number; w: number; h: number }
}

interface SelectedParts {
  head?: SelectedPartInfo
  body?: SelectedPartInfo
  leftArm?: SelectedPartInfo
  rightArm?: SelectedPartInfo
}

interface MonsterPreviewProps {
  spriteAtlas: SpriteAtlas | null
  spriteSheets: string | null
  partPreviews: PartPreviews
  selectedPartsMonster: React.MutableRefObject<SelectedParts>
}

export default function PreviewMonster({
  spriteAtlas,
  spriteSheets,
  partPreviews,
  selectedPartsMonster,
}: MonsterPreviewProps) {
  const phaserContainerRef = useRef<HTMLDivElement>(null)
  const phaserRef = useRef<Phaser.Game | null>(null)
  const sceneRef = useRef<Phaser.Scene | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const debugRef = useRef<DebugLogHandle>(null)

  useEffect(() => {
    if (!phaserContainerRef.current || !spriteAtlas || !spriteSheets) return

    let monsterImage: HTMLImageElement

    class PreviewScene extends Phaser.Scene {
      constructor() {
        super('PreviewScene')
      }

      preload() {
        this.load.image('monsterImage', spriteSheets + '?v=' + Date.now())
      }

      create() {
        monsterImage = this.textures.get('monsterImage').getSourceImage() as HTMLImageElement

        this.textures.addAtlasJSONHash('monster', monsterImage, spriteAtlas!)

        generateStayAnimations(this)
        sceneRef.current = this

        updateDisplay(this)
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS,
      width: 250,
      height: 350,
      parent: phaserContainerRef.current,
      transparent: true,
      scale: { mode: Phaser.Scale.NONE },
      scene: PreviewScene,
    }

    phaserRef.current = new Phaser.Game(config)

    debugRef.current?.log('🎞️ Фреймы в spriteAtlas:', Object.keys(spriteAtlas.frames))
    ;(window as any).updatePhaserDisplay = async () => {
      try {
        if (sceneRef.current) {
          updateDisplay(sceneRef.current)
        }
      } catch (err) {
        debugRef.current?.log(err instanceof Error ? err.message : String(err))
        setErrorMsg((prev) => `${prev}\n${err instanceof Error ? err.message : String(err)}`)
      }
    }

    return () => {
      phaserRef.current?.destroy(true)
    }
  }, [spriteAtlas, spriteSheets])

  const generateStayAnimations = (scene: Phaser.Scene) => {
    const texture = scene.textures.get('monster')

    debugRef.current?.log('📦 Фреймы в Phaser:', texture.getFrameNames())

    if (!spriteAtlas?.frames || Object.keys(spriteAtlas.frames).length === 0) {
      setErrorMsg(`No frames found in atlas`)
      return
    }

    const stayAnimations: Record<string, string[]> = {}

    for (const frameName in spriteAtlas.frames) {
      if (!texture.has(frameName)) {
        setErrorMsg(`${frameName} not found in texture`)
        return
      }

      if (frameName.includes('/stay/')) {
        const match = frameName.match(/^(.*\/stay)\/[^/]+$/)
        if (!match) continue
        const animKey = `${match[1]}_stay`
        if (!stayAnimations[animKey]) stayAnimations[animKey] = []
        stayAnimations[animKey].push(frameName)
      }
    }

    for (const animKey in stayAnimations) {
      debugRef.current?.log(`🎬 Создание анимации: ${animKey}`, stayAnimations[animKey])
      scene.anims.create({
        key: animKey,
        frames: stayAnimations[animKey].sort().map((f) => ({ key: 'monster', frame: f })),
        frameRate: 6,
        repeat: -1,
      })
    }
  }

  const updateDisplay = (scene: Phaser.Scene) => {
    scene.children.removeAll()

    const scale = 0.2
    const bodyX = 0
    const bodyY = 145

    const body = selectedPartsMonster.current.body
    if (!body) return

    const bodyKey = body.key.replace(/_\d+$/, '')
    const bodyFrame = partPreviews.body.find((f) => f.key === body.key)?.frameData
    const bodyPoints = bodyFrame?.points
    if (!bodyPoints) return

    const drawPart = (part: SelectedPartInfo, attachPoint: { x: number; y: number }) => {
      const animKey = part.key.replace(/\/[^/]+$/, '') + '_stay'
      scene.add
        .sprite(
          bodyX + (attachPoint.x - part.attachPoint.x) * scale,
          bodyY + (attachPoint.y - part.attachPoint.y) * scale,
          'monster',
        )
        .setOrigin(0, 0)
        .setScale(scale)
        .play(animKey)
    }

    if (selectedPartsMonster.current.leftArm && bodyPoints.attachLeftArm) {
      drawPart(selectedPartsMonster.current.leftArm, bodyPoints.attachLeftArm)
    }

    scene.add
      .sprite(bodyX, bodyY, 'monster')
      .setOrigin(0, 0)
      .setScale(scale)
      .play(`${bodyKey}_stay`)

    if (selectedPartsMonster.current.rightArm && bodyPoints.attachRightArm) {
      drawPart(selectedPartsMonster.current.rightArm, bodyPoints.attachRightArm)
    }

    if (selectedPartsMonster.current.head && bodyPoints.attachToHead) {
      drawPart(selectedPartsMonster.current.head, bodyPoints.attachToHead)
    }
  }

  return errorMsg ? (
    <>{errorMsg}</>
  ) : (
    <>
      {errorMsg && <div style={{ color: 'red' }}>{errorMsg}</div>}
      <DebugLogPanel ref={debugRef} />
      <div ref={phaserContainerRef} style={{ margin: '20px auto' }} />
    </>
  )
}
