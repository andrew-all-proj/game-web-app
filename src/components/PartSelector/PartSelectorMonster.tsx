import styles from './PartSelector.module.css'
import { FrameData } from '../../types/sprites'
import SpriteCropper from './SpriteCropper'

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

interface TabItem {
  key: string
  icon: string
  alt: string
  parts: PartItem[]
  selectedIndex: number
  setSelectedIndex: (i: number) => void
}

interface PartSelectorProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabKey: string) => void
  spriteUrl: string | null
  onSelectPart: (part: PartItem) => void
}

export default function PartSelectorMonster({
  tabs,
  activeTab,
  onTabChange,
  onSelectPart,
  spriteUrl,
}: PartSelectorProps) {
  const currentTab = tabs.find((tab) => tab.key === activeTab)

  const parts = currentTab?.parts || []
  const selectedIndex = currentTab?.selectedIndex ?? -1
  const onSelect = currentTab?.setSelectedIndex ?? (() => {})

  const fullParts: PartItem[] = [...parts]
  while (fullParts.length < 8) {
    fullParts.push(null)
  }

  return (
    <div className={styles.selectPart}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`${styles.tabIcon} ${activeTab === tab.key ? styles.activeTab : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            <img src={tab.icon} alt={tab.alt} className={styles.tabIconImage} />
          </div>
        ))}
      </div>

      <div className={styles.gridWrapper}>
        {fullParts.map((item, index) => {
          const onClick = () => {
            if (item) {
              onSelect(index) 
              onSelectPart(item)
            }
          }

          if (!item) {
            return <div key={index} className={styles.partItem} />
          }

          if ('arm' in item) {
            return (
              <div key={index} className={styles.partItem} onClick={onClick}>
                <SpriteCropper
                  spriteSrc={spriteUrl}
                  frame={item.arm.right.frameData.frame}
                  width={64}
                  height={64}
                />
              </div>
            )
          }

          if ('frameData' in item) {
            return (
              <div
                key={index}
                className={`${styles.partItem} ${index === selectedIndex ? styles.active : ''}`}
                onClick={onClick}
              >
                <SpriteCropper
                  spriteSrc={spriteUrl}
                  frame={item.frameData.frame}
                  width={64}
                  height={64}
                />
              </div>
            )
          }

          return <div key={index} className={styles.partItem} />
        })}
      </div>
    </div>
  )
}
