import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import styles from './ResultBattle.module.css'
import MainButton from '../../components/Button/MainButton'
import { GetBattleReward } from '../../types/BattleRedis'
import monsterStore from '../../stores/MonsterStore'
import TitleSvg from '../../components/TitlteSvg/TitleSvg'
import BattleReward from './BattleReward'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const ResultBattle = observer(
  ({ win, battleReward }: { win: boolean; battleReward: GetBattleReward | null }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()

    useEffect(() => {
      if (!battleReward) {
        navigate('/laboratory')
      }
    }, [battleReward, navigate])

    const monsterAvatar = monsterStore.selectedMonster?.avatar

    return (
      <div
        className={styles.resultBattle}
        style={{
          backgroundColor: win ? 'var(--green-primary-color)' : 'var(--red-primary-color)',
        }}
      >
        <div className={styles.header}>
          <TitleSvg
            fontSize={40}
            text={win ? t('resultBattle.victory') : t('resultBattle.defeat')}
            fill={win ? 'var(--pink-secondary-color)' : 'var(--yellow-primary-color)'}
          />
        </div>

        {win ? (
          ''
        ) : (
          <div className={styles.messageBubble}>
            <span>{t('resultBattle.tryAgain')}</span>
          </div>
        )}

        <div className={styles.content}>
          {monsterAvatar && (
            <img
              src={monsterAvatar}
              alt="monster"
              className={styles.monsterAvatar}
              draggable={false}
            />
          )}

          <BattleReward battleReward={battleReward} />
        </div>
        <div className={styles.bottomMenu}>
          <MainButton
            color={'var(--white-primary-color)'}
            backgroundColor={'var(--blue-primary-color)'}
            onClick={() => navigate('/laboratory')}
          >
            {t('resultBattle.mainMenu')}
          </MainButton>
        </div>
      </div>
    )
  },
)

export default ResultBattle
