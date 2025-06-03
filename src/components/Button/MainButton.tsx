import styles from './MainButton.module.css'

interface MainButtonProps {
  children: React.ReactNode
  onClick: () => void
}

export default function MainButton({ children, onClick }: MainButtonProps) {
  return (
    <button className={styles.mainButton} onClick={onClick}>
      {children}
    </button>
  )
}