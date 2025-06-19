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
  const debugRef = useRef<DebugLogHandle>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!phaserContainerRef.current || !spriteAtlas || !spriteSheets) return

    let monsterImage: HTMLImageElement

    class PreviewScene extends Phaser.Scene {
      constructor() {
        super('PreviewScene')
      }

      preload() {
        debugRef.current?.log('🖼️ Загружаем atlas image:', spriteSheets)
        this.load.image('monsterImage', spriteSheets + '?v=' + Date.now())
        this.load.on('complete', () => {
          debugRef.current?.log('✅ Загрузка изображений завершена')
        })
      }

      create() {
        monsterImage = this.textures.get('monsterImage').getSourceImage() as HTMLImageElement
        this.textures.addAtlasJSONHash('monster', monsterImage, spriteAtlas!)

        debugRef.current?.log('🎞️ Фреймы из atlas:', Object.keys(spriteAtlas!.frames))
        generateStayAnimations(this)
        sceneRef.current = this
        updateDisplay(this)
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS,
      width: 300, // увеличил размер для уверенности
      height: 300,
      parent: phaserContainerRef.current,
      transparent: true,
      scale: { mode: Phaser.Scale.NONE },
      scene: PreviewScene,
    }

    phaserRef.current = new Phaser.Game(config)

    ;(window as any).updatePhaserDisplay = async () => {
      try {
        if (sceneRef.current) {
          updateDisplay(sceneRef.current)
        }
      } catch (err) {
        debugRef.current?.log('❌ Ошибка обновления дисплея:', err)
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

    const stayAnimations: Record<string, string[]> = {}

    for (const frameName in spriteAtlas!.frames) {
      if (!texture.has(frameName)) {
        debugRef.current?.log(`❌ Frame not found in texture: ${frameName}`)
        continue
      }

      const match = frameName.match(/^(.*\/stay)\/[^/]+$/)
      if (!match) continue

      const animKey = `${match[1]}_stay`
      if (!stayAnimations[animKey]) stayAnimations[animKey] = []
      stayAnimations[animKey].push(frameName)
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
    const bodyX = 50
    const bodyY = 200

    const body = selectedPartsMonster.current.body
    if (!body) return

    const bodyFrame = partPreviews.body.find((f) => f.key === body.key)?.frameData
    const bodyPoints = bodyFrame?.points
    if (!bodyPoints) return

    const drawPart = (part: SelectedPartInfo, attachPoint: { x: number; y: number }) => {
      const baseAnimKey = part.key.replace(/\/[^/]+$/, '')
      const animKey = baseAnimKey + '_stay'
      const x = bodyX + (attachPoint.x - part.attachPoint.x) * scale
      const y = bodyY + (attachPoint.y - part.attachPoint.y) * scale

      debugRef.current?.log(`🧩 ${animKey} at (${x.toFixed(1)}, ${y.toFixed(1)})`)
      scene.add.sprite(x, y, 'monster').setOrigin(0, 0).setScale(scale).play(animKey)
    }

    // Body
    const baseBodyKey = body.key.replace(/\/[^/]+$/, '') + '_stay'
    debugRef.current?.log(`🧍 Тело: ${baseBodyKey}`)
    scene.add.sprite(bodyX, bodyY, 'monster').setOrigin(0, 0).setScale(scale).play(baseBodyKey)

    // Arms & head
    if (selectedPartsMonster.current.leftArm && bodyPoints.attachLeftArm) {
      drawPart(selectedPartsMonster.current.leftArm, bodyPoints.attachLeftArm)
    }

    if (selectedPartsMonster.current.rightArm && bodyPoints.attachRightArm) {
      drawPart(selectedPartsMonster.current.rightArm, bodyPoints.attachRightArm)
    }

    if (selectedPartsMonster.current.head && bodyPoints.attachToHead) {
      drawPart(selectedPartsMonster.current.head, bodyPoints.attachToHead)
    }
  }

  return (
    <>
      {errorMsg && <div style={{ color: 'red' }}>{errorMsg}</div>}
      <DebugLogPanel ref={debugRef} />
      <div
        ref={phaserContainerRef}
        style={{
          margin: '20px auto',
          position: 'relative',
          width: '500px',
          height: '700px',
          backgroundColor: '#222',
          zIndex: 1,
        }}
      />
    </>
  )
}
