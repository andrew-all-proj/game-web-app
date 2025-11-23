import { useTranslation } from 'react-i18next'
import styles from './CardFeedMonster.module.css'

interface CardFeedMonsterProps {
  url: string
  satiety: number
  name: string
  disabled?: boolean
  onButtonClick: () => void
}

function getSatietyClass(satiety: number) {
  if (satiety < 25) return styles.satietyLow
  if (satiety < 50) return styles.satietyMid
  if (satiety < 75) return styles.satietyHigh
  return styles.satietyFull
}

export default function CardFeedMonster({
  url,
  satiety,
  name,
  disabled = false,
  onButtonClick,
}: CardFeedMonsterProps) {
  const isMax = satiety >= 100
  const isDisabled = isMax || disabled
  const { t } = useTranslation();

  return (
    <div className={styles.cardFeedMonster}>
      <div
        className={`${styles.wrapperImage} ${getSatietyClass(satiety)} ${isDisabled ? styles.dim : ''}`}
      >
        <img className={styles.monsterImage} alt="monster" src={url} />
      </div>

      <div className={styles.satietyInfo}>
        <span>{t('foodMenu.name')}: {name}</span>
        <span>{t('foodMenu.satiety')}: {satiety}/100</span>
      </div>

      <div className={styles.buttonWrapper}>
        <button
          type="button"
          className={`${styles.feedButton} ${isDisabled ? styles.feedButtonDisabled : ''}`}
          onClick={onButtonClick}
          disabled={isDisabled}
          aria-disabled={isDisabled}
        >
          {isMax ? t('foodMenu.full') : t('foodMenu.feed')}
        </button>
      </div>
    </div>
  )
}
