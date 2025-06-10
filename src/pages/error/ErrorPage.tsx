import { observer } from 'mobx-react-lite'
import errorStore from '../../stores/ErrorStore'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const ErrorPage = observer(() => {
  const navigate = useNavigate()
  const error = errorStore.error

  useEffect(() => {
    if (!error?.error) {
      navigate('/')
    }
  }, [error, navigate])

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <p>Что-то пошло не так</p>
      <p>{error?.message}</p>
      <button onClick={handleReload} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Перезагрузить
      </button>
    </div>
  )
})

export default ErrorPage
