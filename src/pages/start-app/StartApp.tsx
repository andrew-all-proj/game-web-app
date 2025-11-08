import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import errorStore from '../../stores/ErrorStore'
import userStore from '../../stores/UserStore'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import Loading from '../loading/Loading'
import monsterStore from '../../stores/MonsterStore'

const StartApp = observer(() => {
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      const resultAuth = await authorizationAndInitTelegram(navigate)
      let startParam: string | undefined

      try {
        const tg = (window as any).Telegram?.WebApp
        startParam = tg?.initDataUnsafe?.start_param
      } catch (e) {
        startParam = undefined
      }

      if (resultAuth) {
        await monsterStore.fetchMonsters()
      }

      if (errorStore.error?.error) {
        navigate('/error')
      } else if (!userStore.user?.isRegistered) {
        navigate('/create-user')
      } else {
        if (startParam === 'food-menu') {
          navigate('/food-menu')
        } else {
          navigate('/laboratory')
        }
      }

      setIsLoading(false)
    })()
  }, [navigate])

  return isLoading ? <Loading /> : null
})

export default StartApp
