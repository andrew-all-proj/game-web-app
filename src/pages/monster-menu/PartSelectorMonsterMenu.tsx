import { Monster, Skill, UserInventory } from '../../types/GraphResponse'
import styles from './PartSelectorMonsterMenu.module.css'
import SkillsGrid from './SkillsGrid'
import MutagensGrid from './MutagensGrid'
import { SkillType } from '../../types/enums/SkillType'
import { useTranslation } from 'react-i18next'

interface PartSelectorProps {
  inventories: UserInventory[]
  monster: Monster
  activeTab: 'skills' | 'mutagens'
  applyInventoryId?: string
  onTabChange: (tabKey: 'skills' | 'mutagens') => void
  onSelectInventory: (inv: UserInventory) => void
  onSelectedMonsterSkill: (skill: Skill) => void
}

const TABS = [
  { key: 'skills' as const, textKey: 'monsterMenu.skills' },
  { key: 'mutagens' as const, textKey: 'monsterMenu.mutagens' },
]

export default function PartSelectorMonsterMenu({
  inventories,
  activeTab,
  monster,
  applyInventoryId,
  onTabChange,
  onSelectInventory,
  onSelectedMonsterSkill,
}: PartSelectorProps) {
  const { t } = useTranslation()
  let typeSkillForReplace: SkillType | null = null
  if (applyInventoryId) {
    typeSkillForReplace =
      inventories.find((inv) => inv.id === applyInventoryId)?.skill?.type || null
  }
  return (
    <div className={styles.selectPart}>
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <div
            key={tab.key}
            className={`${styles.tabIcon} ${activeTab === tab.key ? styles.activeTab : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            <span className={styles.tabText}>{t(tab.textKey)}</span>
          </div>
        ))}
      </div>

      {activeTab === 'skills' ? (
        <SkillsGrid
          monsterAttacks={monster.monsterAttacks}
          monsterDefenses={monster.monsterDefenses}
          onSelectedMonsterSkill={onSelectedMonsterSkill}
          typeSkillForReplace={typeSkillForReplace}
        />
      ) : (
        <MutagensGrid inventory={inventories} onSelectInventory={onSelectInventory} />
      )}
    </div>
  )
}
