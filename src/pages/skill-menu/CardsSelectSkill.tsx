import { UserInventoryTypeEnum } from '../../types/enums/UserInventoryTypeEnum'
import { UserInventory } from '../../types/GraphResponse'
import styles from './CardsSelectSkill.module.css'
import RoundButton from '../../components/Button/RoundButton'
import upgradeIcon from '../../assets/icon/upgrade-icon.svg'

interface CardsSelectSkillProps {
  inventoriesStore: UserInventory[]
  onSelectSkill: (userInventory: UserInventory) => void
}

export default function CardsSelectSkill({
  inventoriesStore,
  onSelectSkill,
}: CardsSelectSkillProps) {
  const skills = inventoriesStore.filter(
    (inventory) => inventory.userInventoryType === UserInventoryTypeEnum.SKILL && inventory.skill,
  )

  return (
    <div className={styles.CardsSelectSkil}>
      {skills.flatMap((inventory) =>
        Array.from({ length: inventory.quantity }, (_, i) => (
          <div className={styles.skillCard} key={`${inventory.id}-${i}`}>
            <div className={styles.wrapperImage}>
              <img
                className={styles.skillIcon}
                alt={inventory.skill.name}
                src={inventory.skill.iconFile?.url || upgradeIcon}
              />
            </div>
            <div className={styles.skillName}>{inventory.skill.name}</div>
            <RoundButton
              onClick={() => onSelectSkill(inventory)}
              type={'plus'}
              color={'var(--green-secondary-color)'}
            />
          </div>
        )),
      )}
    </div>
  )
}
