import { useTranslation } from 'react-i18next'
import MainButton from '../../components/Button/MainButton'
import RoundButton from '../../components/Button/RoundButton'
import { Skill, UserInventory } from '../../types/GraphResponse'
import styles from './InfoPopupSkill.module.css'
import upgradeIcon from '../../assets/icon/upgrade-icon.svg'

interface InfoPopupMutagenProps {
  userInventory: UserInventory | null
  showInfoPopupSkill: boolean
  onClose: () => void
  onClick: () => void
  onClickDelete: (userInventory: UserInventory) => void
  monsterId?: string
}

function getEffectLines(
  skill: Skill,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  const effects = []
  if (skill?.strength)
    effects.push(
      <div key="strength">
        <b>
          {skill.strength > 0 ? 'x' : ''}
          {skill.strength}
        </b>
        <br />
        {t('skillMenu.fromStrength')}
      </div>,
    )
  if (skill?.defense)
    effects.push(
      <div key="defense">
        <b>
          {skill.defense > 0 ? 'x' : ''}
          {skill.defense}
        </b>
        <br />
        {t('skillMenu.fromDefense')}
      </div>,
    )
  if (skill?.evasion)
    effects.push(
      <div key="evasion">
        <b>
          {skill.evasion > 0 ? 'x' : ''}
          {skill.evasion}
        </b>
        <br />
        {t('skillMenu.fromEvasion')}
      </div>,
    )
  if (!effects.length) effects.push(<div key="none">{t('skillMenu.noEffect')}</div>)
  return effects
}

const InfoPopupSkill = ({
  userInventory,
  showInfoPopupSkill,
  onClose,
  onClick,
  onClickDelete,
  monsterId,
}: InfoPopupMutagenProps) => {
  const { t } = useTranslation()

  if (!userInventory || !showInfoPopupSkill) return null
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.wrapperImage}>
            <img
              src={userInventory.skill?.iconFile?.url || upgradeIcon}
              alt=""
              className={styles.icon}
            />
          </div>
          <span className={styles.title}>
            {userInventory.skill?.name || t('skillMenu.skillFallback')}
          </span>
          <RoundButton type={'back'} onClick={onClose} className={styles.closeBtn} />
        </div>
        <div className={styles.body}>
          <div className={styles.desc}>
            {userInventory.skill?.description || t('skillMenu.skillDescriptionFallback')} <br />
            {t('skillMenu.energyCost', { cost: userInventory.skill?.energyCost })}
            <br />
            {t('skillMenu.shouldApply')}
          </div>
          <div className={styles.effect}>
            {getEffectLines(userInventory.skill, t).map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
        <MainButton
          onClick={() => {
            onClick()
          }}
          backgroundColor={`var(--green-primary-color)`}
        >
          {monsterId ? t('skillMenu.apply') : t('skillMenu.selectMonster')}
        </MainButton>
        <MainButton
          onClick={() => {
            onClickDelete(userInventory)
          }}
          backgroundColor={`var(--red-primary-color)`}
        >
          {t('skillMenu.dispose')}
        </MainButton>
      </div>
    </div>
  )
}

export default InfoPopupSkill
