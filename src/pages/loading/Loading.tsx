import { observer } from 'mobx-react-lite'
import Lottie from 'lottie-react'
import loadingAnimation from '../../assets/lottie/loading_eye_monstr.json'
import styles from './Loading.module.css'
import label from '../../assets/icon/label-icon.svg'

const Loading = observer(() => {
  return (
    <div className={styles.loadingPage}>
      <div className={styles.lottieWrapper}>
        <Lottie animationData={loadingAnimation} loop autoplay />
      </div>
      <img src={label} alt="Mutantorium" className={styles.labelIcon} />
    </div>
  )
})

export default Loading
