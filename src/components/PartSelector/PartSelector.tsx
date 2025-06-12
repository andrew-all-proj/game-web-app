import React from 'react'
import styles from './PartSelector.module.css'

interface PartSelectorProps<T extends string> {
  tabs: { key: T; icon: string; alt: string }[]
  activeTab: T
  onTabChange: (tabKey: T) => void
  renderGrid: () => React.ReactNode
}

export default function PartSelector<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  renderGrid,
}: PartSelectorProps<T>) {
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
      <div className={styles.gridWrapper}>{renderGrid()}</div>
    </div>
  )
}
