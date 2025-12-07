import styles from './CardSkillDescriptions.module.css'
import MonsterStore from '../../stores/MonsterStore'
import { useTranslation } from 'react-i18next'

interface CardsSelectSkillProps {
  monsterId: string
  skillId: string
  monsterStore: typeof MonsterStore
}

export default function CardSkillDescriptions({
  monsterId,
  skillId,
  monsterStore,
}: CardsSelectSkillProps) {
  const { t } = useTranslation()
  const monster = monsterStore.getMonsterById(monsterId)
  if (!monster) {
    return null
  }
  const monsterAttack = monster?.monsterAttacks.find((attack) => attack.skillId === skillId)
  let skill = monsterAttack?.skill
  if (!skill) {
    const monsterDefens = monster?.monsterDefenses.find((attack) => attack.skillId === skillId)
    skill = monsterDefens?.skill
    if (!skill) {
      return null
    }
  }

  const statLines = [
    skill.defense ? t('skillMenu.defenseMultiplier', { value: skill.defense }) : null,
    skill.strength ? t('skillMenu.strengthMultiplier', { value: skill.strength }) : null,
    skill.evasion ? t('skillMenu.evasionMultiplier', { value: skill.evasion }) : null,
  ].filter(Boolean) as string[]

  return (
    <div className={styles.cardSkillDescriptions}>
      <div className={styles.wrapperImage}>
        <img src={skill.iconFile?.url} alt={skill.name || ''} className={styles.icon} />
      </div>

      <div className={styles.descriptionSkill}>
        {skill.name && (
          <div className={styles.row}>
            <b>{t('skillMenu.nameLabel')}:</b> {skill.name}
          </div>
        )}

        {skill.description && (
          <div className={styles.row}>
            <b>{t('skillMenu.descriptionLabel')}:</b> {skill.description}
          </div>
        )}

        {statLines.length > 0 && <div className={styles.row}>{statLines.join(' ')}</div>}

        {skill.energyCost && (
          <div className={styles.row}>
            <b>{t('skillMenu.staminaCostLabel')}:</b> {skill.energyCost}
          </div>
        )}
      </div>
    </div>
  )
}
