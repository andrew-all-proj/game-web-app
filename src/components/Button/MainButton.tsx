import styles from './MainButton.module.css'

interface MainButtonProps {
  children: React.ReactNode
  onClick: () => void
  width?: string | number
  height?: string | number
  color?: string
  backgroundColor?: string
}

export default function MainButton({
  children,
  onClick,
  width,
  height,
  color,
  backgroundColor,
}: MainButtonProps) {
  return (
    <button
      className={styles.mainButton}
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
