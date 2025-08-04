import { ReactNode, CSSProperties } from 'react'
import styles from './CardMenuMonster.module.css'
import MonsterAvatar from '../MonsterAvatar/MonsterAvatar'

interface CardFeedMonsterProps {
  url: string
  level: number
  onButtonClick: () => void
  textButton?: string
  children?: ReactNode
  buttonStyle?: CSSProperties
  disabled?: boolean
}

export default function CardMenuMonster({
  url,
  level,
  onButtonClick,
  textButton = 'Выбрать',
  children,
  buttonStyle,
  disabled,
}: CardFeedMonsterProps) {
  return (
    <div className={styles.cardMenuMonster}>
      <MonsterAvatar url={url} level={level} />
      <div className={styles.satietyInfo}>{children}</div>
      <div className={styles.buttonWrapper}>
        <button
          className={styles.cardButton}
          onClick={onButtonClick}
          style={buttonStyle}
          disabled={disabled}
        >
          {textButton}
        </button>
      </div>
    </div>
  )
}
