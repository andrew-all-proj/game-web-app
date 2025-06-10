import styles from './Header.module.css'
import avatarImage from '../../assets/images/no-avatar.jpg'

interface HeaderProps {
  avatarUrl?: string
}

export default function Header({ avatarUrl }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.avatarWrapper}>
        <img src={avatarUrl || avatarImage} alt="Аватар" className={styles.avatar} />
      </div>
      <span className={styles.title}>Mutantorium</span>
    </header>
  )
}
