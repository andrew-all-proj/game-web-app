import styles from './StatBarEnergy.module.css'

interface StatBarProps {
  current: number
  max?: number
  color?: string
  backgroundColor?: string
  textColor?: string
  width?: number
  height?: number
  title?: string
}

export default function StatBarEnergy({
  current,
  max,
  color = 'var(--caribbean-green-scale-energy)',
  backgroundColor = '#2484A4',
  textColor = '#2d2421',
  title
}: StatBarProps) {
  const percent = max ? Math.max(0, Math.min((current / max) * 100, 100)) : 100
  const text = max ? `${current}/${max}` : `${current}`

  return (
    <div className={styles.barBackground} style={{ backgroundColor }}>
      <div className={styles.barFill} style={{ width: `${percent}%`, backgroundColor: color }} />
      <div className={styles.barTitle } style={{ color: textColor }}>{title}</div>
      <div className={styles.barText} style={{ color: textColor }}>
        {text}
      </div>
    </div>
  )
}
