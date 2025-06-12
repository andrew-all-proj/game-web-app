import React from 'react'
import styles from './CreateMonster.module.css'
import { PartPreviews } from './CreateMonster'
import SpriteCropper from './SpriteCropper'

type PartTab = keyof PartPreviews

interface PartGridProps {
  partPreviews: PartPreviews
  activeTab: PartTab
  spriteUrl: string | null
  handlePartSelect: (part: any) => void
}

const MonsterPartGrid: React.FC<PartGridProps> = ({
  partPreviews,
  activeTab,
  spriteUrl,
  handlePartSelect,
}) => {
  if (!partPreviews[activeTab]) return null

  const fullParts = [...partPreviews[activeTab]]
  while (fullParts.length < 12) {
    fullParts.push(null as any)
  }

  return (
    <div className={styles.grid}>
      {fullParts.map((pair, index) => {
        const onClick = () => handlePartSelect(pair)

        if (!pair) {
          return <div key={index} className={styles.partItem} />
        }

        if (activeTab === 'arms' && 'arm' in pair) {
          return (
            <div key={index} className={styles.partItem} onClick={onClick}>
              <SpriteCropper
                spriteSrc={spriteUrl}
                frame={pair.arm?.right?.frameData.frame}
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
