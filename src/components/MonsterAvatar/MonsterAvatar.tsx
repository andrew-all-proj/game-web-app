import styles from './MonsterAvatar.module.css'

interface MonsterAvatarProps {
  url: string
  level: number
  className?: string
}

const getSatietyClass = (level: number): string => {
  if (level < 5) return styles.levelLow
  if (level < 10) return styles.levelMid
  if (level < 15) return styles.levelHigh
  return styles.levelMax
}

export default function MonsterAvatar({ url, level, className = '' }: MonsterAvatarProps) {
  return (
    <div className={`${styles.wrapperImage} ${getSatietyClass(level)} ${className}`}>
      <img className={styles.monsterImage} alt="monster" src={url} />
    </div>
  )
}
