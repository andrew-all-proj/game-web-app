import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'

import styles from './NotFoundMonsters.module.css'
import MainButton from '../../components/Button/MainButton'
import TitleSvg from '../../components/TitlteSvg/TitleSvg'
import { useTranslation } from 'react-i18next'

const NotFoundMonsters = observer(() => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className={styles.notFoundMonsters}>
      <TitleSvg
        fontSize={35}
        text={t('laboratory.noMonstersTitle')}
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
        <MainButton onClick={() => navigate('/create-monster')}>
          {t('laboratory.create')}
        </MainButton>
      </div>
    </div>
  )
})

export default NotFoundMonsters
