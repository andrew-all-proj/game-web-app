import styles from './PartSelector.module.css'
import { FrameData } from '../../types/sprites'
import SpriteCropper from './SpriteCropper'

export type PartIconEntry = {
  id: string
  key: string
  frameData: FrameData
}

type PartItem = PartIconEntry | null

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
  onSelectPart: (id: string) => void
}

export default function PartSelectorMonster({
  tabs,
  activeTab,
  onTabChange,
  onSelectPart,
  spriteUrl,
}: PartSelectorProps) {
  const currentTab = tabs.find((tab) => tab.key === activeTab)

  const parts: PartItem[] = currentTab?.parts || []
  const selectedIndex = currentTab?.selectedIndex ?? -1
  const onSelectIndex = currentTab?.setSelectedIndex ?? (() => {})

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

      {/* Сетка иконок */}
      <div className={styles.gridWrapper}>
        {fullParts.map((item, index) => {
          if (!item) {
            return <div key={index} className={styles.partItem} />
          }

          const handleClick = () => {
            onSelectIndex(index)
            onSelectPart(item.id)
          }

          return (
            <div
              key={item.key}
              className={`${styles.partItem} ${index === selectedIndex ? styles.active : ''}`}
              onClick={handleClick}
            >
              <SpriteCropper
                spriteSrc={spriteUrl}
                frame={item.frameData.frame}
                width={64}
                height={64}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
