import React from 'react'
import styles from './PopupCard.module.css'
import MainButton from '../../components/Button/MainButton'

interface PopupCardProps {
  title: string
  subtitle?: string
  buttonText?: string
  onButtonClick: () => void
  onClose?: () => void
}

const PopupCard: React.FC<PopupCardProps> = ({
  title,
  subtitle,
  buttonText = 'Принять',
  onButtonClick,
  onClose,
}) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.row}>
          <div className={styles.titleBlock}>
            <div className={styles.title}>{title}</div>
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          </div>
        </div>
        <MainButton
          onClick={onButtonClick}
          height={'70px'}
          backgroundColor="var(--green-secondary-color)"
        >
          {buttonText}
        </MainButton>
      </div>
    </div>
  )
}

export default PopupCard
