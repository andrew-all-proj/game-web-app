import { observer } from 'mobx-react-lite'
import Lottie from 'lottie-react'
import { useEffect, useState } from 'react'
import loadingAnimation from '../../assets/lottie/loading_eye_monstr.json'
import styles from './Loading.module.css'
import label from '../../assets/icon/label-icon.svg'
import { useNavigate } from 'react-router-dom'
import errorStore from '../../stores/ErrorStore'

const Loading = observer(() => {
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      setError(true)
    }, 60000) // 60 seconds

    return () => clearTimeout(timer)
  }, [])

  if (error) {
    errorStore.setError({ error: true, message: 'Слишком долго...' })
    navigate('/error')
  }

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
