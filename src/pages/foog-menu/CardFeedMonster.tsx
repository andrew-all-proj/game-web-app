import styles from './CardFeedMonster.module.css'

interface CardFeedMonsterProps {
  url: string
  satiety: number
  onButtonClick: () => void
}

function getSatietyClass(satiety: number) {
  if (satiety < 25) return styles.satietyLow
  if (satiety < 50) return styles.satietyMid
  if (satiety < 75) return styles.satietyHigh
  return styles.satietyFull
}

export default function CardFeedMonster({ url, satiety, onButtonClick }: CardFeedMonsterProps) {
  const isMax = satiety >= 100

  return (
    <div className={styles.cardFeedMonster}>
      <div className={`${styles.wrapperImage} ${getSatietyClass(satiety)}`}>
        <img className={styles.monsterImage} alt="monster" src={url} />
      </div>
      <div className={styles.satietyInfo}>
        <span>Сытость:</span>
        <span>{satiety}/100</span>
      </div>
      <div className={styles.buttonWrapper}>
        <button
          className={`${styles.feedButton} ${isMax ? styles.feedButtonDisabled : ''}`}
          onClick={onButtonClick}
          disabled={isMax}
        >
          Кормить
        </button>
      </div>
    </div>
  )
}

