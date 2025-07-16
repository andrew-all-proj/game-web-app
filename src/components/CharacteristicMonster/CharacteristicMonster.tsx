import styles from './CharacteristicMonster.module.css'
import hpIcon from '../../assets/icon/small-hp-icon.svg'
import staminaIcon from '../../assets/icon/small-stamina-icon.svg'
import strenghtIcon from '../../assets/icon/small-strength-icon.svg'
import defenceIcon from '../../assets/icon/small-defence-icon.svg'
import evasionIcon from '../../assets/icon/small-evasion-icon.svg'

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
        <img src={hpIcon} alt="hp" className={styles.icon} />
        <span>{hp}</span>
      </div>
      <div className={styles.charLine}>
        <img src={staminaIcon} alt="stamina" className={styles.icon} />
        <span>{stamina}</span>
      </div>
      <div className={styles.charLine}>
        <img src={strenghtIcon} alt="stamina" className={styles.icon} />
        <span>{strength}</span>
      </div>
      <div className={styles.charLine}>
        <img src={defenceIcon} alt="stamina" className={styles.icon} />
        <span>{defense}</span>
      </div>
      <div className={styles.charLine}>
        <img src={evasionIcon} alt="stamina" className={styles.icon} />
        <span>{evasion}</span>
      </div>
    </div>
  )
}
