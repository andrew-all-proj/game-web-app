import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import { PartPreviews } from './CreateMonster'
import { SpriteAtlas } from '../../types/sprites'

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

  useEffect(() => {
    if (!phaserContainerRef.current || !spriteAtlas || !spriteSheets) return

    if (Object.keys(spriteAtlas.frames).length === 0) {
        setErrorMsg('No frames found in atlas: ' + JSON.stringify(spriteAtlas.frames))
        return
    }

    const waitForSceneReady = (timeout = 7000): Promise<Phaser.Scene> =>
      new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          if (sceneRef.current) {
            clearInterval(interval)
            resolve(sceneRef.current)
          }
        }, 50)
        setTimeout(() => {
          clearInterval(interval)
          reject(new Error('Scene initialization timed out'))
        }, timeout)
      })

    ;(window as any).updatePhaserDisplay = async () => {
      try {
        const scene = await waitForSceneReady()
        updateDisplay(scene)
      } catch (err) {
        console.error('Failed to update display:', err)
        setErrorMsg(err instanceof Error ? err.message : String(err))
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS,
      width: 250,
      height: 350,
      parent: phaserContainerRef.current,
      transparent: true,
      scale: { mode: Phaser.Scale.NONE },
      scene: {
        preload(this: Phaser.Scene) {
          this.load.atlas('monster', spriteSheets, spriteAtlas)
        },
        create(this: Phaser.Scene) {
          generateStayAnimations(this)
          sceneRef.current = this
        },
        update() {},
      },
    }

    phaserRef.current = new Phaser.Game(config)

    return () => {
      phaserRef.current?.destroy(true)
    }
  }, [spriteAtlas, spriteSheets])

  const generateStayAnimations = (scene: Phaser.Scene) => {
    const stayAnimations: Record<string, string[]> = {}

    const texture = scene.textures.get('monster')

    if (!spriteAtlas?.frames || Object.keys(spriteAtlas.frames).length === 0) {
      setErrorMsg((prev) => `${prev}\nNo frames found in atlas`)
      return
    }

    for (const frameName in spriteAtlas.frames) {
      if (!texture.has(frameName)) {
        setErrorMsg((prev) => `${prev}\nFrame "${frameName}" not found in texture`)
        continue
      }

      if (frameName.includes('/stay/')) {
        const baseKey = frameName.replace(/_\d+$/, '')
        const animKey = `${baseKey}_stay`
        if (!stayAnimations[animKey]) stayAnimations[animKey] = []
        stayAnimations[animKey].push(frameName)
      }
    }

    for (const frameName in spriteAtlas.frames) {
      const texture = scene.textures.get('monster')
      if (!texture.has(frameName)) {
        setErrorMsg(`${errorMsg} \nFrame "${frameName}" not found in atlas`)
        return
      }
      if (frameName.includes('/stay/')) {
        const baseKey = frameName.replace(/_\d+$/, '')
        const animKey = `${baseKey}_stay`
        if (!stayAnimations[animKey]) stayAnimations[animKey] = []
        stayAnimations[animKey].push(frameName)
      }
    }

    for (const animKey in stayAnimations) {
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
      const partKey = part.key.replace(/_\d+$/, '')
      scene.add
        .sprite(
          bodyX + (attachPoint.x - part.attachPoint.x) * scale,
          bodyY + (attachPoint.y - part.attachPoint.y) * scale,
          'monster',
        )
        .setOrigin(0, 0)
        .setScale(scale)
        .play(`${partKey}_stay`)
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
    <div ref={phaserContainerRef} style={{ margin: '20px auto' }} />
  )
}
