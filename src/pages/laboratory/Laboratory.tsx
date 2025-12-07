import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import userStore from '../../stores/UserStore'
import { useNavigate } from 'react-router-dom'
import styles from './Laboratory.module.css'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import Loading from '../loading/Loading'
import monsterStore from '../../stores/MonsterStore'
import MainButton from '../../components/Button/MainButton'
import NotFoundMonsters from './NotFoundMonsters'
import SecondButton from '../../components/Button/SecondButton'
import foodIcon from '../../assets/icon/food-icon.svg'
import labIcon from '../../assets/icon/lab-icon.svg'
import upgradeIcon from '../../assets/icon/upgrade-icon.svg'
import socialIcon from '../../assets/icon/icon_social.svg'
import { Monster } from '../../types/GraphResponse'
import StatBarButton from '../../components/Button/StatBarButton'
import StatBarMain from '../../components/StatBar/StatBarMain'
import RoundButton from '../../components/Button/RoundButton'
import MonsterAvatarWithShadow from '../../components/MonsterAvatarWithShadow/MonsterAvatarWithShadow'
import { showTopAlert } from '../../components/TopAlert/topAlertBus'
import InputBox from '../../components/InputBox/InputBox'
import { useTranslation } from 'react-i18next'

const Laboratory = observer(() => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [monsterIndex, setMonsterIndex] = useState(0)
  const { t } = useTranslation()

  const monsters = monsterStore.monsters
  const selectedMonster = monsters[monsterIndex]

  const isActive = Boolean(selectedMonster?.isSelected)

  useEffect(() => {
    ;(async () => {
      const success = await authorizationAndInitTelegram(navigate)
      if (success && userStore.user?.id) {
        await userStore.fetchUser(userStore.user.id)
        const fetchedMonsters = monsterStore.monsters
        const selectedIndex = fetchedMonsters.findIndex((monster) => monster.isSelected)
        setMonsterIndex(selectedIndex !== -1 ? selectedIndex : 0)
        setIsLoading(false)
      }
    })()
  }, [navigate])

  const handleGoToArena = (monster: Monster) => {
    if ((userStore.user?.energy ?? 0) < 125) {
      showTopAlert({
        open: true,
        text: t('laboratory.notEnoughEnergy', { value: userStore.user?.energy ?? 0 }),
        variant: 'warning',
      })
      userStore.fetchUser(userStore.user?.id) //TODO THINKING
      return
    }
    monsterStore.setSelectedMonster(monster.id)
    if (!monsterStore.selectedMonster) {
      showTopAlert({
        open: true,
        text: t('laboratory.selectPet'),
        variant: 'warning',
      })
      return
    }
    if (monsterStore.selectedMonster.satiety < 25) {
      showTopAlert({
        open: true,
        text: t('laboratory.monsterHungry'),
        variant: 'warning',
      })
      return
    }
    navigate('/search-battle')
  }

  const handleGoToCreateUser = () => {
    navigate('/create-user')
  }

  const handleGoToMonsterMenu = (monster: Monster) => {
    if (!monster?.id) return
    navigate(`/monster-menu/${monster.id}`)
  }

  if (isLoading && monsterStore.isLoading) {
    return <Loading />
  }
  if (monsterStore.monsters.length === 0) {
    return <NotFoundMonsters />
  }

  const handlePrevMonster = () => {
    if (monsters.length === 0) return
    const newIndex = (monsterIndex - 1 + monsters.length) % monsters.length
    setMonsterIndex(newIndex)
  }

  const handleNextMonster = () => {
    if (monsters.length === 0) return
    const newIndex = (monsterIndex + 1) % monsters.length
    setMonsterIndex(newIndex)
  }

  const handleSetActive = () => {
    if (!selectedMonster?.id) return
    if (selectedMonster.isSelected) return
    monsterStore.setSelectedMonster(selectedMonster.id)
  }

  return (
    <div className={styles.laboratory}>
      <div className={styles.header}>
        <SecondButton
          className={styles.headerBtnCreate}
          onClick={() => navigate('/create-monster')}
        >
          {t('laboratory.create')}
        </SecondButton>
        <div className={styles.avatarWrapper}>
          <img
            alt="avatar monster"
            src={userStore.user?.avatar?.url}
            onClick={handleGoToCreateUser}
          />
        </div>
        <StatBarButton
          current={userStore.user?.energy || 0}
          max={1000}
          text={t('laboratory.energy')}
          color="#61FFBE"
          backgroundColor="#94c9b3"
          width={120}
          height={48}
          onClick={() => navigate('/energy-menu')}
          className={styles.headerBtnStatBar}
        />
        <StatBarMain
          name={selectedMonster?.name || '???'}
          level={selectedMonster?.level}
          current={selectedMonster?.experiencePoints ?? 0}
          max={selectedMonster?.nextLevelExp}
          width={370}
          height={40}
          className={styles.headerStatBarMain}
        />
        <div className={styles.wrapperInputBox}>
          <InputBox
            isActive={isActive}
            handleSetActive={handleSetActive}
            text={t('laboratory.active')}
          />
        </div>
      </div>
      <div className={styles.centerContent}>
        <div className={styles.avatarMobileContainer}>
          <MonsterAvatarWithShadow
            monster={selectedMonster}
            onClick={() => handleGoToMonsterMenu(selectedMonster)}
          />
        </div>
        <div className={styles.selectMonsters}>
          <RoundButton onClick={handlePrevMonster} color="var(--green-secondary-color)" />
          <MainButton width={210} height={63} onClick={() => handleGoToArena(selectedMonster)}>
            {t('laboratory.arena')}
          </MainButton>
          <RoundButton
            onClick={handleNextMonster}
            type="next"
            color="var(--green-secondary-color)"
          />
        </div>
      </div>
      <div className={styles.bottomMenu}>
        <div className={styles.menuItem}>
          <img
            src={foodIcon}
            alt="food"
            className={styles.tabIconImage}
            onClick={() => {
              if (userStore.user?.id) {
                navigate(`/food-menu`)
              }
            }}
          />
        </div>
        <div className={styles.menuItem}>
          <img
            src={labIcon}
            alt="lab"
            className={styles.tabIconImage}
            onClick={() => {
              if (userStore.user?.id) {
                navigate(`/mutagens-menu`)
              }
            }}
          />
        </div>
        <div className={styles.menuItem}>
          <img
            src={upgradeIcon}
            alt="upgrade"
            className={styles.tabIconImage}
            onClick={() => {
              if (userStore.user?.id) {
                navigate(`/skills-menu`)
              }
            }}
          />
        </div>
        <div className={styles.menuItem}>
          <img src={socialIcon} alt="social" className={styles.tabIconImage} />
        </div>
      </div>
    </div>
  )
})

export default Laboratory
