import styles from './PartSelector.module.css'

interface PartTypeAvatar {
  part: string
  icon: string
}

interface TabItem {
  key: string
  icon: string
  alt: string
  parts: PartTypeAvatar[]
  selectedIndex: number
  setSelectedIndex: (i: number) => void
}

interface PartSelectorProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabKey: string) => void
  setIsEditing: (value: boolean) => void
}

export default function PartSelector({
  tabs,
  activeTab,
  onTabChange,
  setIsEditing,
}: PartSelectorProps) {
  const currentTab = tabs.find((tab) => tab.key === activeTab)

  const parts = currentTab?.parts || []
  const selectedIndex = currentTab?.selectedIndex ?? -1
  const onSelect = currentTab?.setSelectedIndex ?? (() => {})

  const fullParts: (PartTypeAvatar | null)[] = [...parts]
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
        {fullParts.map((part, i) => (
          <div
            key={part?.icon || `empty-${i}`}
            className={`${styles.partItem} ${part && i === selectedIndex ? styles.active : ''}`}
            onClick={() => {
              if (part) {
                onSelect(i)
                setIsEditing(false)
              }
            }}
          >
            {part ? (
              <svg xmlns="http://www.w3.org/2000/svg" className={styles.partItemSvg}>
                <use href={`#${part.icon}`} />
              </svg>
            ) : (
              <div style={{ width: '100%', height: '100%' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
