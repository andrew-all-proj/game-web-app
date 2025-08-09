import { UserInventoryTypeEnum } from '../../types/enums/UserInventoryTypeEnum'
import { UserInventory } from '../../types/GraphResponse'
import styles from './PartSelectorMonsterMenu.module.css'
import upgradeIcon from '../../assets/icon/upgrade-icon.svg'
import mutagenIcon from '../../assets/icon/icon_mutagen.svg'

interface PartSelectorProps {
  inventory: UserInventory[]
  rows?: number
  columns?: number
  activeTab: 'skills' | 'mutagens'
  onTabChange: (tabKey: 'skills' | 'mutagens') => void
  setIsEditing: (value: boolean) => void
  onSelectInventory?: (inv: UserInventory) => void
}

const TABS = [
  { key: 'skills' as const, text: 'Навыки' },
  { key: 'mutagens' as const, text: 'Мутации' },
]

export default function PartSelectorMonsterMenu({
  inventory,
  rows = 2,
  columns = 4,
  activeTab,
  onTabChange,
  setIsEditing,
  onSelectInventory = () => {},
}: PartSelectorProps) {
  const skills = inventory.filter(
    (i) => i.userInventoryType === UserInventoryTypeEnum.SKILL && i.skill
  )
  const mutagens = inventory.filter(
    (i) => i.userInventoryType === UserInventoryTypeEnum.MUTAGEN && i.mutagen
  )

 const list = activeTab === 'skills' ? skills : mutagens

const expanded: UserInventory[] = list.flatMap((inv) =>
  Array.from({ length: inv.quantity ?? 1 }, () => inv)
)

const totalSlots = rows * columns
const items: (UserInventory | null)[] =
  expanded.length >= totalSlots
    ? expanded.slice(0, totalSlots)
    : [...expanded, ...Array.from({ length: totalSlots - expanded.length }, () => null)]


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

      <div
        className={styles.gridWrapper}
        style={{ gridTemplateColumns: `repeat(${columns}, max-content)` }}
      >
        {items.map((inv, i) => (
          <div
            key={inv ? `${inv.id}-${i}` : `empty-${i}`}
            className={`${styles.partItem} ${inv ? '' : styles.partItemEmpty}`}
            onClick={() => {
              if (!inv) return
              onSelectInventory(inv)
              setIsEditing(false)
            }}
          >
            {inv ? (
              <img
                className={styles.partItemImg}
                alt={
                  activeTab === 'skills'
                    ? inv.skill?.name || 'skill'
                    : inv.mutagen?.name || 'mutagen'
                }
                src={
                  activeTab === 'skills'
                    ? inv.skill?.iconFile?.url || upgradeIcon
                    : inv.mutagen?.iconFile?.url || mutagenIcon
                }
                width={56}
                height={56}
              />
            ) : (
              <div style={{ width: '100%', height: '100%' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
