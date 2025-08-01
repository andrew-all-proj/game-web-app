import React, { ReactNode } from 'react'
import styles from './HeaderBar.module.css'

interface HeaderBarProps {
  icon: string
  title: string
  sizeTitle?: number | string
  background?: string
  rightContent?: ReactNode
  style?: React.CSSProperties
}
const HeaderBar: React.FC<HeaderBarProps> = ({
  icon,
  title,
  sizeTitle = 24,
  background = `var(--green-secondary-color)`,
  rightContent,
  style,
}) => {
  return (
    <div className={styles.header} style={{ background, ...style }}>
      <img className={styles.headerIcon} alt="icon" src={icon} />
      <div
        className={styles.headerTextBlock}
        style={{ fontSize: typeof sizeTitle === 'number' ? `${sizeTitle}px` : sizeTitle }}
      >
        {title}
      </div>
      <div className={styles.headerButton}>{rightContent}</div>
    </div>
  )
}

export default HeaderBar
