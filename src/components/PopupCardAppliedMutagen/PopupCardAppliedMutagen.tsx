import React from 'react'
import styles from './PopupCardAppliedMutagen.module.css'
import MainButton from '../Button/MainButton'
import MonsterAvatar from '../MonsterAvatar/MonsterAvatar'

interface PopupCardProps {
  icon: string
  title: string
  subtitle?: React.ReactNode
  levelMonster?: number
  buttonText?: string
  onButtonClick: () => void
  onClose?: () => void
}

const PopupCardAppliedMutagen: React.FC<PopupCardProps> = ({
  icon,
  title,
  subtitle,
  levelMonster = 0,
  buttonText = 'Принять',
  onButtonClick,
  onClose,
}) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.row}>
          <MonsterAvatar url={icon} level={levelMonster} />
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

export default PopupCardAppliedMutagen
