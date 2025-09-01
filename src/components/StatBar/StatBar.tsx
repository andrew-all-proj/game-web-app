import styles from './StatBar.module.css'

interface StatBarProps {
  current: number
  max?: number
  iconSrc?: string
  color?: string
  backgroundColor?: string
  textColor?: string
  width?: number
  iconSize?: number
  height?: number
}

export default function StatBar({
  current,
  max,
  iconSrc,
  color = '#ff4094',
  backgroundColor = '#ff80b5',
  textColor = '#2d2421',
  width = 80,
  height = 14,
  iconSize = 12,
}: StatBarProps) {
  const percent = max ? Math.max(0, Math.min((current / max) * 100, 100)) : 100
  const text = max ? `${current}/${max}` : `${current}`

  return (
    <div className={styles.barBackground} style={{ backgroundColor, width, height }}>
      <div className={styles.barFill} style={{ width: `${percent}%`, backgroundColor: color }} />
      {iconSrc ? (
        <div className={styles.barIcon}>
          <img src={iconSrc} alt="stat icon" style={{ width: iconSize, height: iconSize }} />
        </div>
      ) : null}
      <div className={styles.barText} style={{ color: textColor }}>
        {text}
      </div>
    </div>
  )
}
