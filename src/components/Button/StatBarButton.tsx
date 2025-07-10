import styles from './StatBarButton.module.css'

interface StatBarButtonProps {
  current: number
  max?: number
  text: string
  onClick?: () => void
  color?: string
  backgroundColor?: string
  textColor?: string
  width?: number
  height?: number
}

export default function StatBarButton({
  current,
  max,
  text,
  onClick,
  color = '#ff4094',
  backgroundColor = '#ff80b5',
  textColor = '#2d2421',
  width = 60,
  height = 14,
}: StatBarButtonProps) {
  const percent = max ? Math.max(0, Math.min((current / max) * 100, 100)) : 100

  return (
    <button
      className={styles.barButton}
      onClick={onClick}
      style={{
        width,
        height,
        padding: 0,
        cursor: 'pointer',
        position: 'relative',
        backgroundColor: 'transparent',
      }}
    >
      <div
        className={styles.barBackground}
        style={{ backgroundColor, width: '100%', height: '100%' }}
      >
        <div className={styles.barFill} style={{ width: `${percent}%`, backgroundColor: color }} />
        <div className={styles.barText} style={{ color: textColor }}>
          {text}
        </div>
      </div>
    </button>
  )
}
