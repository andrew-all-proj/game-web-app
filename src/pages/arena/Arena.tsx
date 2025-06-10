import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import userStore from '../../stores/UserStore'

import styles from './Arena.module.css'
import Header from '../../components/Header/Header'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import Loading from '../loading/Loading'
import TestFight from './TestFight'
import MainButton from '../../components/Button/MainButton'

const Arena = observer(() => {
  const navigate = useNavigate()

  const handleGoToLab = () => {
    navigate('/laboratory')
  }

  useEffect(() => {
    authorizationAndInitTelegram(navigate)
  }, [])

  if (!userStore.isAuthenticated) {
    return <Loading />
  }

  return (
    <div className={styles.arena}>
      <Header avatarUrl={userStore.user?.avatar?.url} />
      <main className={styles.main}>
        <div className={styles.logoPlaceholder}>
          ARENA — Привет, профессор {userStore.user?.nameProfessor ?? 'Гость'}!
        </div>

        <TestFight />
        <MainButton onClick={handleGoToLab}>Лаборатория</MainButton>
      </main>
    </div>
  )
})

export default Arena
