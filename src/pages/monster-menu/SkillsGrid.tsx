import { UserInventoryTypeEnum } from '../../types/enums/UserInventoryTypeEnum'
import { UserInventory } from '../../types/GraphResponse'
import styles from './PartSelectorMonsterMenu.module.css'
import upgradeIcon from '../../assets/icon/upgrade-icon.svg' // корректный файл
import unionIcon from '../../assets/icon/union-icon.svg'
import { SkillType } from '../../types/enums/SkillType'

interface Props {
  inventory: UserInventory[]
  //onSelectInventory: (inv: UserInventory) => void
}

export default function SkillsGrid({ inventory }: Props) {
  const columns = 3

  const skills = inventory.filter(
    (i) => i.userInventoryType === UserInventoryTypeEnum.SKILL && i.skill,
  )

  const attacks = skills.filter((i) => i.skill?.type === SkillType.ATTACK)
  const defenses = skills.filter((i) => i.skill?.type === SkillType.DEFENSE)

  const expand = (items: UserInventory[]) =>
    items.flatMap((inv) =>
      Array.from({ length: inv.quantity ?? 1 }, (_, k) => ({ inv, k })),
    )

  const fillRow = (items: { inv: UserInventory; k: number }[]) => {
    const trimmed = items.slice(0, columns)
    return trimmed.length >= columns
      ? trimmed
      : [...trimmed, ...Array.from({ length: columns - trimmed.length }, () => null)]
  }

  const attackRow = fillRow(expand(attacks))
  const defenseRow = fillRow(expand(defenses))

  const rowsData = [attackRow, defenseRow]

  return (
    <div className={styles.gridWrapperSkills} style={{ display: 'grid', gap: 8 }}>
      {rowsData.map((row, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className={styles.row}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, max-content)`,
            gridAutoFlow: 'row',
            gap: 8,
          }}
        >
          {row.map((item, i) => (
            <div
              key={item ? `${item.inv.id}-${item.k}` : `empty-${rowIndex}-${i}`}
              className={`${styles.partItem} ${item ? '' : styles.partItemEmpty}`}
              onClick={() => {
                if (!item) return
                // onSelectInventory(item.inv) // закомментировано, так как не используется
              }}
            >
              {item ? (
                <img
                  className={styles.partItemImg}
                  alt={item.inv.skill?.name || 'skill'}
                  src={item.inv.skill?.iconFile?.url || upgradeIcon}
                  width={56}
                  height={56}
                />
              ) : (
                <img
                  className={styles.partItemImg}
                  alt="empty slot"
                  src={unionIcon}
                  width={56}
                  height={56}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
