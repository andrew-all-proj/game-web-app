import styles from './CharacteristicMonster.module.css'
import heartIcon from '../../assets/icon/small-heart-icon.svg'
import staminaIcon from '../../assets/icon/small-heart-icon.svg'

interface Props {
  level: number
  hp: number
  stamina: number
  strength: number
  defense: number
  evasion: number
  className?: string
}

export default function CharacteristicMonster({
  level,
  hp,
  stamina,
  strength,
  defense,
  evasion,
  className,
}: Props) {
  return (
    <div className={`${styles.wrapper} ${className || ''}`}>
      <div className={styles.level}>Lvl. {level}</div>
      <div className={styles.charLine}>
        <img src={heartIcon} alt="hp" className={styles.icon} />
        <span>{hp}</span>
      </div>
      <div className={styles.charLine}>
        <img src={staminaIcon} alt="stamina" className={styles.icon} />
        <span>{stamina}</span>
      </div>
      <div className={styles.charLine}>
        <img src={staminaIcon} alt="stamina" className={styles.icon} />
        <span>{strength}</span>
      </div>
      <div className={styles.charLine}>
        <img src={staminaIcon} alt="stamina" className={styles.icon} />
        <span>{defense}</span>
      </div>
      <div className={styles.charLine}>
        <img src={staminaIcon} alt="stamina" className={styles.icon} />
        <span>{evasion}</span>
      </div>
    </div>
  )
}
