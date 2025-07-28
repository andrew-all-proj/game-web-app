import styles from './MainButton.module.css'

interface MainButtonProps {
  children: React.ReactNode
  onClick: () => void
  width?: string | number
  height?: string | number
  color?: string
  backgroundColor?: string
  className?: string
}

export default function MainButton({
  children,
  onClick,
  width,
  height,
  color,
  backgroundColor,
  className = ''
}: MainButtonProps) {
  return (
    <button
      className={`${styles.mainButton} ${className}`.trim()}
      onClick={onClick}
      style={{
        width,
        height,
        color,
        backgroundColor,
      }}
    >
      {children}
    </button>
  )
}
