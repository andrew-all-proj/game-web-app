import styles from './CardGetFood.module.css'

interface CardGetFoodProps {
  onButtonClick: () => void
  disabled: boolean
}

export default function CardGetFood({ onButtonClick, disabled = false }: CardGetFoodProps) {
  return (
    <div className={styles.cardFeedMonster}>
      <div className={styles.satietyInfo}>
        <span>Если все плохо и нечем кормить монстров попроси еду в соц.службах</span>
      </div>

      <div className={styles.buttonWrapper}>
        <button
          type="button"
          className={`${styles.feedButton} ${disabled ? styles.feedButtonDisabled : ''}`}
          onClick={onButtonClick}
          disabled={disabled}
          aria-disabled={disabled}
        >
          {'Попросить'}
        </button>
      </div>
    </div>
  )
}
