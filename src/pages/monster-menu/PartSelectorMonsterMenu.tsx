import { UserInventory } from '../../types/GraphResponse'
import styles from './PartSelectorMonsterMenu.module.css'
import SkillsGrid from './SkillsGrid'
import MutagensGrid from './MutagensGrid'

interface PartSelectorProps {
  inventory: UserInventory[]
  activeTab: 'skills' | 'mutagens'
  onTabChange: (tabKey: 'skills' | 'mutagens') => void
  onSelectInventory: (inv: UserInventory) => void
}

const TABS = [
  { key: 'skills' as const, text: 'Навыки' },
  { key: 'mutagens' as const, text: 'Мутации' },
]

export default function PartSelectorMonsterMenu({
  inventory,
  activeTab,
  onTabChange,
  onSelectInventory,
}: PartSelectorProps) {
  return (
    <div className={styles.selectPart}>
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <div
            key={tab.key}
            className={`${styles.tabIcon} ${activeTab === tab.key ? styles.activeTab : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            <span className={styles.tabText}>{tab.text}</span>
          </div>
        ))}
      </div>

      {activeTab === 'skills' ? (
        <SkillsGrid
          inventory={inventory}
         
        />
      ) : (
        <MutagensGrid
          inventory={inventory}
          onSelectInventory={onSelectInventory}
        />
      )}
    </div>
  )
}
