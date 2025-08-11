import MainButton from '../Button/MainButton'
import RoundButton from '../Button/RoundButton'
import { Mutagen, UserInventory } from '../../types/GraphResponse'
import styles from './InfoPopupMutagen.module.css'
import mutagenIcon from '../../assets/icon/icon_mutagen.svg'

interface InfoPopupMutagenProps {
  userInventory: UserInventory | null
  onClose: () => void
  onClick: (userInventory: UserInventory) => void
}

function getEffectLines(mutagen: Mutagen) {
  const effects = []
  if (mutagen.strength)
    effects.push(
      <div key="strength">
        <b>
          {mutagen.strength > 0 ? '±' : ''}
          {mutagen.strength}
        </b>
        <br />к Силе
      </div>,
    )
  if (mutagen.defense)
    effects.push(
      <div key="defense">
        <b>
          {mutagen.defense > 0 ? '±' : ''}
          {mutagen.defense}
        </b>
        <br />к Защите
      </div>,
    )
  if (mutagen.evasion)
    effects.push(
      <div key="evasion">
        <b>
          {mutagen.evasion > 0 ? '±' : ''}
          {mutagen.evasion}
        </b>
        <br />к Увороту
      </div>,
    )
  if (!effects.length) effects.push(<div key="none">Без эффекта</div>)
  return effects
}

const InfoPopupMutagen = ({ userInventory, onClose, onClick }: InfoPopupMutagenProps) => {
  if (!userInventory) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <img
            src={userInventory.mutagen.iconFile?.url || mutagenIcon}
            alt=""
            className={styles.icon}
          />
          <span className={styles.title}>{userInventory.mutagen.name || 'Мутаген'}</span>
          <RoundButton type={'back'} onClick={onClose} className={styles.closeBtn} />
        </div>
        <div className={styles.body}>
          <div className={styles.desc}>
            {userInventory.mutagen.description || 'Описание мутагена...'} <br />
            <br />
            Стоит ли?
          </div>
          <div className={styles.effect}>
            {getEffectLines(userInventory.mutagen).map((line, i) => (
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
          Применить
        </MainButton>
      </div>
    </div>
  )
}

export default InfoPopupMutagen
