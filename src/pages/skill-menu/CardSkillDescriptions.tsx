import styles from './CardSkillDescriptions.module.css'
import MonsterStore from '../../stores/MonsterStore'

interface CardsSelectSkillProps {
  monsterId: string
  skillId: string
  monsterStore: typeof MonsterStore 
}

export default function CardSkillDescriptions({
  monsterId,
  skillId,
  monsterStore
}: CardsSelectSkillProps) {
  
  const monster = monsterStore.getMonsterById(monsterId)
  if(!monster) {
    return
  }
  const monsterAttack = monster?.monsterAttacks.find((attack) => attack.skillId === skillId)
  let skill = monsterAttack?.skill
  if(!skill) {
    const monsterDefens = monster?.monsterDefenses.find((attack) => attack.skillId === skillId)
    skill = monsterDefens?.skill
    if(!skill) {
      return
    }
  }

  return (
    <div className={styles.cardSkillDescriptions}>
      <div className={styles.wrapperImage}>
        <img src={skill.iconFile?.url} alt={skill.name || ''} className={styles.icon} />
      </div>

      <div className={styles.descriptionSkill}>
        {skill.name && (
          <div className={styles.row}>
            <b>Название:</b> {skill.name}
          </div>
        )}

        {skill.description && (
          <div className={styles.row}>
            <b>Описание:</b> {skill.description}
          </div>
        )}

        {(skill.defense || skill.strength || skill.evasion) && (
          <div className={styles.row}>
            {skill.defense ? `Защита: +${skill.defense} ` : ''}
            {skill.strength ? `Атака: +${skill.strength} ` : ''}
            {skill.evasion ? `Уклонение: +${skill.evasion} ` : ''}
          </div>
        )}

        {skill.energyCost && (
          <div className={styles.row}>
            <b>Стоимость выносливости:</b> {skill.energyCost}
          </div>
        )}
      </div>
    </div>
  )
}
