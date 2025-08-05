import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'

import styles from './NotFoundMonsters.module.css'
import MainButton from '../../components/Button/MainButton'
import TitleSvg from '../../components/TitlteSvg/TitleSvg'

const NotFoundMonsters = observer(() => {
  const navigate = useNavigate()

  return (
    <div className={styles.notFoundMonsters}>
      <TitleSvg
        fontSize={35}
        text={'Пришло время\nсоздать своего\nпервого монстрика!'}
        fill={'var(--yellow-primary-color)'}
        width={420}
        height={150}
      />
      <div className={styles.centerContent}>
        <div className={styles.questionWrapper}>
          <div className={styles.questionMark}>?</div>
          <div className={styles.dotWrapper}>
            <div className={styles.outerDot}>
              <div className={styles.innerDot}></div>
            </div>
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
