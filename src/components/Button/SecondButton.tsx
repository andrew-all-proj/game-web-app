import styles from './SecondButton.module.css'

interface MainButtonProps {
  children: React.ReactNode
  onClick: () => void
}

export default function SecondButton({ children, onClick }: MainButtonProps) {
  return (
    <button className={styles.mainButton} onClick={onClick}>
      {children}
    </button>
  )
}
