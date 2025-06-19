import { observer } from 'mobx-react-lite'
import errorStore from '../../stores/ErrorStore'
import { useNavigate } from 'react-router-dom'

const ErrorPage = observer(() => {
  const navigate = useNavigate()
  const error = errorStore.error

  const handleReload = () => {
    errorStore.clearError()
    navigate('/')
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
