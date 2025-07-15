import WebApp from '@twa-dev/sdk'
import userStore from '../stores/UserStore'
import errorStore from '../stores/ErrorStore'
import { NavigateFunction } from 'react-router-dom'

export const authorizationAndInitTelegram = async (
  navigate: NavigateFunction,
): Promise<boolean> => {
  WebApp.ready()
  WebApp.expand()

  if (userStore.isAuthenticated) {
    return true
  }

  let tgUser = WebApp.initDataUnsafe?.user
  let initData = WebApp.initData

  if (import.meta.env.VITE_LOCAL && (!tgUser || !initData)) {
    tgUser = {
      id: 123456789,
      first_name: 'DevUser',
      username: 'devuser',
    }

    initData = new URLSearchParams({
      user: JSON.stringify(tgUser),
      chat_instance: 'test_chat_instance',
      chat_type: 'sender',
      auth_date: Math.floor(Date.now() / 1000).toString(),
      hash: 'test_hash',
    }).toString()
  }

  if (tgUser && initData) {
    try {
      const userLogin = await userStore.loginUser(initData, tgUser)
      if (!userLogin) {
        errorStore.setError({ error: true, message: 'Ошибка регистрации!' })
        navigate('/error')
        return false
      }
    } catch (err) {
      errorStore.setError({ error: true, message: `Ошибка регистрации: ${err}` })
      navigate('/error')
      return false
    }
  } else {
    errorStore.setError({
      error: true,
      message: 'Игра работает только в телеграме',
    })
    navigate('/error')
    return false
  }

  if (!userStore.user?.isRegistered) {
    navigate('/')
    return false
  }
  return true
}
