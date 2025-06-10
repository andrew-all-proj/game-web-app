import styles from './Loading.module.css'
import { observer } from 'mobx-react-lite'

const Loading = observer(() => {
  return (
    <>
      <div className={styles.loadingPage}>
        <div className={styles.spinner} />
        <h1 className={styles.loadingTitle}>Mutantorium</h1>
      </div>
    </>
  )
})

export default Loading
