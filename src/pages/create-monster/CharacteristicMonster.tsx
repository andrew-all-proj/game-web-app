import styles from './CharacteristicMonster.module.css'
import heartIcon from '../../assets/icon/small-heart-icon.svg'
import staminaIcon from '../../assets/icon/small-heart-icon.svg'

interface Props {
  level: number
  hp: number
  stamina: number
}

export default function CharacteristicMonster({ level, hp, stamina }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.level}>Lvl. {level}</div>
      <div className={styles.charLine}>
        <img src={heartIcon} alt="hp" className={styles.icon} />
        <span>{hp}</span>
      </div>
      <div className={styles.charLine}>
        <img src={staminaIcon} alt="stamina" className={styles.icon} />
        <span>{stamina}</span>
      </div>
    </div>
  )
}
