import styles from './PartSelectorMonsterMenu.module.css'
import upgradeIcon from '../../assets/icon/upgrade-icon.svg'
import questionIcon from '../../assets/icon/question-icon.svg'

import { MonsterAttacks, MonsterDefenses, Skill } from '../../types/GraphResponse'
import { SkillType } from '../../types/enums/SkillType'

interface Props {
  monsterAttacks: MonsterAttacks[]
  monsterDefenses: MonsterDefenses[]
  typeSkillForReplace?: SkillType | null
  onSelectedMonsterSkill: (skill: Skill) => void
}

export default function SkillsGridFromMonster({
  monsterAttacks,
  monsterDefenses,
  onSelectedMonsterSkill,
  typeSkillForReplace,
}: Props) {
  const columns = 3

  const attacks = (monsterAttacks ?? []).map((ma) => ma.skill).filter(Boolean) as Skill[]
  const defenses = (monsterDefenses ?? []).map((md) => md.skill).filter(Boolean) as Skill[]

  const fillRow = (rowItems: Skill[]) =>
    rowItems.length >= columns
      ? rowItems.slice(0, columns)
      : [
          ...rowItems,
          ...Array.from({ length: columns - rowItems.length }, () => null as unknown as Skill),
        ]

  const attackRow = fillRow(attacks)
  const defenseRow = fillRow(defenses)

  const items = [
    ...attackRow.map((s) => ({ skill: s, type: SkillType.ATTACK })),
    ...defenseRow.map((s) => ({ skill: s, type: SkillType.DEFENSE })),
  ]

  const Grid = (
    <div
      className={`${styles.gridWrapperSkills} ${typeSkillForReplace ? styles.dimAll : ''}`}
      style={{ gridTemplateColumns: `repeat(${columns}, max-content)` }}
    >
      {items.map((item, i) => {
        const isPlaceholder = !item.skill
        const isMatch = !!typeSkillForReplace && typeSkillForReplace === item.type
        const isDisabled = !!typeSkillForReplace && !isMatch // ← не тот тип → отключаем

        const className = [
          styles.partItem,
          isPlaceholder ? styles.partItemEmptySkill : '',
          isMatch ? styles.partItemHighlight : '',
          isDisabled ? styles.partItemDisabled : '',
        ]
          .join(' ')
          .trim()

        return (
          <div
            key={item.skill ? `skill-${item.skill.id}-${i}` : `empty-${i}`}
            className={className}
            onClick={() => {
              if (!item.skill || isDisabled) return // ← блок клика
              onSelectedMonsterSkill(item.skill)
            }}
          >
            {item.skill ? (
              <img
                className={styles.partItemImg}
                alt={item.skill.name || 'skill'}
                src={item.skill.iconFile?.url || upgradeIcon}
                width={56}
                height={56}
              />
            ) : (
              <img
                className={styles.partItemImg}
                alt="skill"
                src={questionIcon}
                width={56}
                height={56}
              />
            )}
          </div>
        )
      })}
    </div>
  )

  return <div className={styles.gridViewport}>{Grid}</div>
}
