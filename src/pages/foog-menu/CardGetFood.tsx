import { useTranslation } from 'react-i18next'
import styles from './CardGetFood.module.css'

interface CardGetFoodProps {
  onButtonClick: () => void
  disabled: boolean
}

export default function CardGetFood({ onButtonClick, disabled = false }: CardGetFoodProps) {
  const { t } = useTranslation()
  return (
    <div className={styles.cardFeedMonster}>
      <div className={styles.satietyInfo}>
        <span>{t('foodMenu.requestFoodHint')}</span>
      </div>

      <div className={styles.buttonWrapper}>
        <button
          type="button"
          className={`${styles.feedButton} ${disabled ? styles.feedButtonDisabled : ''}`}
          onClick={onButtonClick}
          disabled={disabled}
          aria-disabled={disabled}
        >
          {t('foodMenu.getFood')}
        </button>
      </div>
    </div>
  )
}
