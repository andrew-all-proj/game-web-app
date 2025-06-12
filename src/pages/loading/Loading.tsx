import styles from './Loading.module.css'
import { observer } from 'mobx-react-lite'
import label from '../../assets/icon/label-icon.svg'

const Loading = observer(() => {
  return (
    <>
      <div className={styles.loadingPage}>
        <div className={styles.spinner} />
        <img src={label} alt="Mutantorium" className={styles.labelIcon} />
      </div>
    </>
  )
})

export default Loading
