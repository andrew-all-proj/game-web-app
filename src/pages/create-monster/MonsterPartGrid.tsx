import React from 'react'
import styles from './CreateMonster.module.css'
import { PartPreviews, SelectablePart } from './CreateMonster'
import SpriteCropper from './SpriteCropper'
import { FrameData } from '../../types/sprites'

type PartTab = keyof PartPreviews

type PartSingle = {
  key: string
  frameData: FrameData
}

type PartArm = {
  arm: {
    left: {
      key: string
      frameData: FrameData
    }
    right: {
      key: string
      frameData: FrameData
    }
  }
}

type PartItem = PartSingle | PartArm | null

interface PartGridProps {
  partPreviews: PartPreviews
  activeTab: PartTab
  spriteUrl: string | null
  handlePartSelect: (part: SelectablePart) => void
}

const MonsterPartGrid: React.FC<PartGridProps> = ({
  partPreviews,
  activeTab,
  spriteUrl,
  handlePartSelect,
}) => {
  if (!partPreviews[activeTab]) return null

  const fullParts: PartItem[] = [...partPreviews[activeTab]]
  while (fullParts.length < 12) {
    fullParts.push(null)
  }

  return (
    <div className={styles.grid}>
      {fullParts.map((pair, index) => {
        const onClick = () => handlePartSelect(pair)

        if (!pair) {
          return <div key={index} className={styles.partItem} />
        }

        if ('arm' in pair && 'right' in pair.arm) {
          return (
            <div key={index} className={styles.partItem} onClick={onClick}>
              <SpriteCropper
                spriteSrc={spriteUrl}
                frame={pair.arm.right.frameData.frame}
                width={64}
                height={64}
              />
            </div>
          )
        }

        if ('frameData' in pair) {
          return (
            <div key={index} className={styles.partItem} onClick={onClick}>
              <SpriteCropper
                spriteSrc={spriteUrl}
                frame={pair.frameData.frame}
                width={64}
                height={64}
              />
            </div>
          )
        }

        return <div key={index} className={styles.partItem} />
      })}
    </div>
  )
}

export default MonsterPartGrid
