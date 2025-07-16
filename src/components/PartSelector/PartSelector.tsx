import styles from './PartSelector.module.css'

interface PartTypeAvatar {
  part: string
  icon: string
}

interface TabItem {
  key: string
  text?: string
  icon?: string
  alt?: string
  parts: PartTypeAvatar[]
  selectedIndex: number
  setSelectedIndex: (i: number) => void
}

interface PartSelectorProps {
  tabs: TabItem[]
  rows?: number
  columns?: number
  activeTab: string
  onTabChange: (tabKey: string) => void
  setIsEditing: (value: boolean) => void
}

export default function PartSelector({
  tabs,
  rows = 2,
  columns = 4,
  activeTab,
  onTabChange,
  setIsEditing, //TODO remove
}: PartSelectorProps) {
  const currentTab = tabs.find((tab) => tab.key === activeTab)

  const parts = currentTab?.parts || []
  const selectedIndex = currentTab?.selectedIndex ?? -1
  const onSelect = currentTab?.setSelectedIndex ?? (() => {})

  const totalSlots = rows * columns
  const fullParts: (PartTypeAvatar | null)[] = [...parts]
  while (fullParts.length < totalSlots) {
    fullParts.push(null)
  }

  console.log('tabs', tabs)

  return (
    <div className={styles.selectPart}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`${styles.tabIcon} ${activeTab === tab.key ? styles.activeTab : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.icon && <img src={tab.icon} alt={tab.alt || ''} className={styles.tabIconImage} />}
            {tab.text && <span className={styles.tabText}>{tab.text}</span>}
          </div>
        ))}
      </div>

      <div
        className={styles.gridWrapper}
        style={{
          gridTemplateColumns: `repeat(${columns}, max-content)`,
        }}
      >
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
