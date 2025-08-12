import { UserInventoryTypeEnum } from '../../types/enums/UserInventoryTypeEnum'
import { Monster, UserInventory } from '../../types/GraphResponse'
import styles from './CardsSelectSkill.module.css'
import RoundButton from '../../components/Button/RoundButton'
import upgradeIcon from '../../assets/icon/upgrade-icon.svg'
import { SkillType } from '../../types/enums/SkillType'

interface CardsSelectSkillProps {
  inventoriesStore: UserInventory[]
  onSelectSkill: (userInventory: UserInventory) => void
  skillIdForReplace?: string
  monsters?: Monster[]
}

export default function CardsSelectSkill({
  inventoriesStore,
  skillIdForReplace,
  onSelectSkill,
  monsters,
}: CardsSelectSkillProps) {
  const resolveTypeFromMonsters = (id: string): SkillType | null => {
    for (const m of monsters ?? []) {
      if (m.monsterAttacks?.some((a) => a.skillId === id)) return SkillType.ATTACK
      if (m.monsterDefenses?.some((d) => d.skillId === id)) return SkillType.DEFENSE
    }
    return null
  }

  const typeSkillForReplace: SkillType | null = skillIdForReplace
    ? resolveTypeFromMonsters(skillIdForReplace)
    : null

  const skills = inventoriesStore.filter(
    (inv) =>
      inv.userInventoryType === UserInventoryTypeEnum.SKILL &&
      inv.skill &&
      (typeSkillForReplace === null || inv.skill.type === typeSkillForReplace),
  )

  return (
    <div className={styles.CardsSelectSkill}>
      {skills.flatMap((inventory) =>
        Array.from({ length: inventory.quantity ?? 1 }, (_, i) => (
          <div className={styles.skillCard} key={`${inventory.id}-${i}`}>
            <div className={styles.wrapperImage}>
              <img
                className={styles.skillIcon}
                alt={inventory.skill!.name || 'skill'}
                src={inventory.skill!.iconFile?.url || upgradeIcon}
              />
            </div>
            <div className={styles.skillName}>{inventory.skill!.name}</div>
            <RoundButton
              onClick={() => onSelectSkill(inventory)}
              type="plus"
              color="var(--green-secondary-color)"
            />
          </div>
        )),
      )}
    </div>
  )
}
