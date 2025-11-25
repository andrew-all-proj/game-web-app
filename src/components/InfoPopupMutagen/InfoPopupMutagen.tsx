import MainButton from '../Button/MainButton'
import RoundButton from '../Button/RoundButton'
import { Mutagen, UserInventory } from '../../types/GraphResponse'
import styles from './InfoPopupMutagen.module.css'
import mutagenIcon from '../../assets/icon/icon_mutagen.svg'
import { useTranslation } from 'react-i18next'

interface InfoPopupMutagenProps {
  userInventory: UserInventory | null
  onClose: () => void
  onClick: (userInventory: UserInventory) => void
}

function getEffectLines(
  mutagen: Mutagen,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  const effects = []
  if (mutagen.strength)
    effects.push(
      <div key="strength">
        <b>
          {mutagen.strength > 0 ? '±' : ''}
          {mutagen.strength}
        </b>
        <br />
        {t('mutagensMenu.toStrength')}
      </div>,
    )
  if (mutagen.defense)
    effects.push(
      <div key="defense">
        <b>
          {mutagen.defense > 0 ? '±' : ''}
          {mutagen.defense}
        </b>
        <br />
        {t('mutagensMenu.toDefense')}
      </div>,
    )
  if (mutagen.evasion)
    effects.push(
      <div key="evasion">
        <b>
          {mutagen.evasion > 0 ? '±' : ''}
          {mutagen.evasion}
        </b>
        <br />
        {t('mutagensMenu.toEvasion')}
      </div>,
    )
  if (!effects.length) effects.push(<div key="none">{t('mutagensMenu.noEffect')}</div>)
  return effects
}

const InfoPopupMutagen = ({ userInventory, onClose, onClick }: InfoPopupMutagenProps) => {
  const { t } = useTranslation()

  if (!userInventory || !userInventory.mutagen.id) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <img
            src={userInventory.mutagen.iconFile?.url || mutagenIcon}
            alt=""
            className={styles.icon}
          />
          <span className={styles.title}>
            {userInventory.mutagen.name || t('mutagensMenu.mutagenFallback')}
          </span>
          <RoundButton type={'back'} onClick={onClose} className={styles.closeBtn} />
        </div>
        <div className={styles.body}>
          <div className={styles.desc}>
            {userInventory.mutagen.description || t('mutagensMenu.mutagenDescriptionFallback')}{' '}
            <br />
            <br />
            {t('mutagensMenu.shouldApply')}
          </div>
          <div className={styles.effect}>
            {getEffectLines(userInventory.mutagen, t).map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
        <MainButton
          onClick={() => {
            onClick(userInventory)
          }}
          backgroundColor={`var(--green-primary-color)`}
        >
          {t('mutagensMenu.apply')}
        </MainButton>
      </div>
    </div>
  )
}

export default InfoPopupMutagen
