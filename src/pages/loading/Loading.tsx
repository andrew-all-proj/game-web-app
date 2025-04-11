import styles from "./Loading.module.css"

const Loading = () => {
  return (
    <div className={styles.loadingPage}>
      <div className={styles.spinner} />
      <p>Загрузка...</p>
    </div>
  )
}

export default Loading
