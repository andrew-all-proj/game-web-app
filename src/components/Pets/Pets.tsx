import styles from './Pets.module.css'

export default function Pets() {
  return (
    <div className={styles.pets}>
      <div className={styles.petBlock} />
      <div className={styles.petBlock} />
      <div className={styles.petBlock} />
    </div>
  )
}
