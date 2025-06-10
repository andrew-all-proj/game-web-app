import Phaser from 'phaser'
import { useEffect, useRef, useState } from 'react'
import MainButton from '../../components/Button/MainButton'
import styles from './ConstructorMonster.module.css'
import PartCarousel from './PartCarousel'
import { FrameData, PartName, SpriteAtlas } from '../../types/sprites'

interface ConstructorMonsterProps {
  onError: (msg: string) => void
  saveImage: (monsterName: string, selected: SelectedParts, partPreviews: PartPreviews) => void
  spriteSheets: string
  spriteAtlas: SpriteAtlas
}

interface PartPreviewEntry {
  key: string
  frameData: FrameData
}

export interface PartPreviews {
  head: PartPreviewEntry[]
  body: PartPreviewEntry[]
  arms: { arm: { left?: PartPreviewEntry; right?: PartPreviewEntry } }[]
}

export interface SelectedPartInfo {
  key: string
  attachPoint: { x: number; y: number }
  frameSize: { w: number; h: number; x: number; y: number }
}

export interface SelectedParts {
  head?: SelectedPartInfo
  body?: SelectedPartInfo
  leftArm?: SelectedPartInfo
  rightArm?: SelectedPartInfo
}

export default function ConstructorMonster({
  onError,
  saveImage,
  spriteSheets,
  spriteAtlas,
}: ConstructorMonsterProps) {
  const phaserContainerRef = useRef<HTMLDivElement>(null)
  const phaserRef = useRef<Phaser.Game | null>(null)
  const sceneRef = useRef<Phaser.Scene | null>(null)

  const [typePart, setTypePart] = useState<PartName>('body')
  const [count, setCount] = useState(0)
  const [monsterName, setMonsterName] = useState('')
  const selectedPartsMonster = useRef<SelectedParts>({})
  const [partPreviews, setPartPreviews] = useState<PartPreviews>({ head: [], body: [], arms: [] })

  useEffect(() => {
    const newPartPreviews: PartPreviews = { head: [], body: [], arms: [] }
    const armsMap: Record<string, { left?: PartPreviewEntry; right?: PartPreviewEntry }> = {}

    for (const frameName in spriteAtlas.frames) {
      if (frameName.includes('/stay/')) {
        const [category] = frameName.split('/stay/')
        const partData = spriteAtlas.frames[frameName]
        const previewEntry = { key: frameName, frameData: partData }

        if (category.startsWith('head') && frameName.endsWith('_0')) {
          newPartPreviews.head.push(previewEntry)
        } else if (category.startsWith('body') && frameName.endsWith('_0')) {
          newPartPreviews.body.push(previewEntry)
        } else if (
          (category.startsWith('right_arm') || category.startsWith('left_arm')) &&
          frameName.endsWith('_0')
        ) {
          const splitParts = category.split('/')
          const armSide = splitParts[0]
          const armName = splitParts[1]
          const commonName = armName.replace('left_', '').replace('right_', '')
          if (!armsMap[commonName]) armsMap[commonName] = {}
          if (armSide === 'right_arm') {
            armsMap[commonName].right = previewEntry
          } else if (armSide === 'left_arm') {
            armsMap[commonName].left = previewEntry
          }
        }
      }
    }

    newPartPreviews.arms = Object.values(armsMap).map((armPair) => ({ arm: armPair }))
    setPartPreviews(newPartPreviews)
  }, [spriteAtlas])

  const moveSelectedPart = (direction: 'left' | 'right') => {
    const parts = partPreviews[typePart]
    if (!parts || parts.length === 0) return
    const newIndex =
      direction === 'left' ? (count - 1 + parts.length) % parts.length : (count + 1) % parts.length
    handleSelectedPart(newIndex)
  }

  const handleSelectedPart = (index: number) => {
    setCount(index)
    const parts = partPreviews[typePart]
    const selectedFrame = parts[index]

    if (typePart === 'arms' && 'arm' in selectedFrame) {
      const selectedArmPair = selectedFrame.arm
      selectedPartsMonster.current.leftArm = selectedArmPair.left
        ? extractPartInfo(selectedArmPair.left)
        : undefined
      selectedPartsMonster.current.rightArm = selectedArmPair.right
        ? extractPartInfo(selectedArmPair.right)
        : undefined
    } else if (typePart !== 'arms') {
      const selectedEntry = selectedFrame as PartPreviewEntry
      selectedPartsMonster.current[typePart] = extractPartInfo(selectedEntry)
    }

    if (sceneRef.current) {
      ;(window as any).updatePhaserDisplay(sceneRef.current)
    }
  }

  const extractPartInfo = (entry: PartPreviewEntry): SelectedPartInfo => ({
    key: entry.key,
    attachPoint: entry.frameData?.points?.attachToBody || { x: 0, y: 0 },
    frameSize: {
      w: entry.frameData?.frame?.w,
      h: entry.frameData?.frame?.h,
      x: entry.frameData?.frame?.x,
      y: entry.frameData?.frame?.y,
    },
  })

  const handleSaveClick = () => {
    if (!monsterName.trim()) return onError('Введите имя монстра')
    if (!selectedPartsMonster.current.body) return onError('Выберите тело')
    if (!selectedPartsMonster.current.head) return onError('Выберите голову')
    if (!selectedPartsMonster.current.leftArm) return onError('Выберите руки')
    saveImage(monsterName, selectedPartsMonster.current, partPreviews)
  }

  useEffect(() => {
    if (!phaserContainerRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS,
      width: 250,
      height: 350,
      parent: phaserContainerRef.current,
      transparent: true,
      scale: { mode: Phaser.Scale.NONE },
      scene: { preload, create, update },
    }

    phaserRef.current = new Phaser.Game(config)

    function preload(this: Phaser.Scene) {
      this.load.atlas('monster', spriteSheets, spriteAtlas)
    }

    function create(this: Phaser.Scene) {
      generateStayAnimations(this)
      sceneRef.current = this
      ;(window as any).updatePhaserDisplay(this)
    }

    function update() {}

    function generateStayAnimations(scene: Phaser.Scene) {
      const stayAnimations: Record<string, string[]> = {}
      for (const frameName in spriteAtlas.frames) {
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

    function updateDisplay(scene: Phaser.Scene) {
      scene.children.removeAll()
      const scale = 0.2
      const bodyX = 0
      const bodyY = 145

      const body = selectedPartsMonster.current.body
      if (!body) return

      const bodyKey = body.key.replace(/_\d+$/, '')
      const bodyFrame = partPreviews.body.find((f) => f.key === body.key)?.frameData
      const bodyPoints = bodyFrame?.points

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

      if (selectedPartsMonster.current.leftArm) {
        drawPart(selectedPartsMonster.current.leftArm, bodyPoints?.attachLeftArm || { x: 0, y: 0 })
      }

      scene.add
        .sprite(bodyX, bodyY, 'monster')
        .setOrigin(0, 0)
        .setScale(scale)
        .play(`${bodyKey}_stay`)

      if (selectedPartsMonster.current.rightArm) {
        drawPart(
          selectedPartsMonster.current.rightArm,
          bodyPoints?.attachRightArm || { x: 0, y: 0 },
        )
      }

      if (selectedPartsMonster.current.head) {
        drawPart(selectedPartsMonster.current.head, bodyPoints?.attachToHead || { x: 0, y: 0 })
      }
    }

    ;(window as any).updatePhaserDisplay = updateDisplay

    return () => {
      phaserRef.current?.destroy(true)
    }
  }, [partPreviews])

  return (
    <div>
      <div ref={phaserContainerRef} style={{ margin: '20px auto' }} />
      <div>
        <div className={styles.wrapperCreateMenu}>
          <button className={styles.buttonLeftRight} onClick={() => moveSelectedPart('left')}>
            ◀
          </button>
          <PartCarousel
            partPreviews={partPreviews}
            typePart={typePart}
            count={count}
            handleSelectedPart={handleSelectedPart}
            spriteSheets={spriteSheets}
          />
          <button className={styles.buttonLeftRight} onClick={() => moveSelectedPart('right')}>
            ▶
          </button>
        </div>
        <div className={styles.wrapperCreateMenu}>
          <MainButton onClick={() => setTypePart('head')}>Голова</MainButton>
          <MainButton onClick={() => setTypePart('body')}>Туловище</MainButton>
          <MainButton onClick={() => setTypePart('arms')}>Руки</MainButton>
        </div>
        <div className={styles.wrapperCreateMenu}>
          <input
            type="text"
            placeholder="Введите имя"
            value={monsterName}
            onChange={(e) => setMonsterName(e.target.value)}
            className={styles.nameInput}
          />
          <MainButton onClick={handleSaveClick}>Создать</MainButton>
        </div>
      </div>
    </div>
  )
}
