import styles from './StatBarMain.module.css'

interface StatBarProps {
  current: number
  max?: number
  name: string
  level?: number
  color?: string
  backgroundColor?: string
  textColor?: string
  width?: number
  height?: number
}

export default function StatBar({
  current,
  max,
  name,
  level,
  color = '#65fefb',
  backgroundColor = '#5ed6d4',
  textColor = '#362f2d',
  width = 180,
  height = 35,
}: StatBarProps) {
  const percent = max ? Math.max(0, Math.min((current / max) * 100, 100)) : 100
  const text = max ? `${current}/${max}` : `${current}`
  return (
    <div
      className={styles.barBackground}
      style={{
        backgroundColor,
        width,
        height,
        borderColor: '#362f2d',
      }}
    >
      <div className={styles.barFill} style={{ width: `${percent}%`, backgroundColor: color }} />
      <div className={styles.content}>
        <div className={styles.leftLabel} style={{ color: textColor }}>
          {name}
        </div>
        <div className={styles.centerText}>{text}</div>
        <div className={styles.rightLabel} style={{ color: textColor }}>
          Lvl. {level ?? 0}
        </div>
      </div>
    </div>
  )
}
