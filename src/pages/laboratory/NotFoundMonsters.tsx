import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'

import styles from './NotFoundMonsters.module.css'
import MainButton from '../../components/Button/MainButton'

const NotFoundMonsters = observer(() => {
  const navigate = useNavigate()

  console.log('NotFoundMonsters render')

  return (
    <div className={styles.notFoundMonsters}>
      <h1 className={styles.title}>
        Пришло время
        <br />
        создать своего
        <br />
        первого монстрика!
      </h1>
      <div className={styles.questionWrapper}>
        <div className={styles.questionMark}>?</div>
        <div className={styles.dotWrapper}>
          <div className={styles.outerDot}>
            <div className={styles.innerDot}></div>
          </div>
        </div>
      </div>
      <div className={styles.buttonWrapper}>
        <MainButton onClick={() => navigate('/create-monster')}>Создать</MainButton>
      </div>
    </div>
  )
})

export default NotFoundMonsters
