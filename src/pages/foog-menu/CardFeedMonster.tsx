import styles from './CardFeedMonster.module.css'

interface CardFeedMonsterProps {
  url: string
  satiety: number
  onButtonClick: () => void
}

export default function CardFeedMonster({ url, satiety, onButtonClick }: CardFeedMonsterProps) {
  return (
    <div className={styles.cardFeedMonster}>
      <div className={styles.wrapperImage}>
        <img className={styles.monsterImage} alt="monster" src={url} />
      </div>
      <div className={styles.satietyInfo}>
        <span>Сытость:</span>
        <span>{satiety}/100</span>
      </div>
      <div className={styles.buttonWrapper}>
        <button className={styles.feedButton} onClick={onButtonClick}>
          Кормить
        </button>
      </div>
    </div>
  )
}
