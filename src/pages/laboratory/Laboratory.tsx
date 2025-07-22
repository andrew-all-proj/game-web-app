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
import labIcon from '../../assets/icon/icon_lab.svg'
import upgradeIcon from '../../assets/icon/icon_upgrade.svg'
import socialIcon from '../../assets/icon/icon_social.svg'
import { Monster } from '../../types/GraphResponse'
import StatBarButton from '../../components/Button/StatBarButton'
import StatBarMain from '../../components/StatBar/StatBarMain'
import RoundButton from '../../components/Button/RoundButton'
import MonsterAvatarWithShadow from '../../components/MonsterAvatarWithShadow/MonsterAvatarWithShadow'

const Laboratory = observer(() => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [monsterIndex, setMonsterIndex] = useState(0)

  const monsters = monsterStore.monsters
  const selectedMonster = monsters[monsterIndex]

  useEffect(() => {
    ;(async () => {
      const success = await authorizationAndInitTelegram(navigate)
      if (success && userStore.user?.id) {
        await monsterStore.fetchMonsters(userStore.user.id)
        const fetchedMonsters = monsterStore.monsters
        const selectedIndex = fetchedMonsters.findIndex((monster) => monster.isSelected)

        setMonsterIndex(selectedIndex !== -1 ? selectedIndex : 0)

        await userStore.fetchUser(userStore.user.id)
      }
      setIsLoading(false)
    })()
  }, [navigate])

  const handleGoToArena = (monster: Monster) => {
    if ((userStore.user?.energy ?? 0) < 125) {
      setErrorMsg(`Недостаточно энергии для боя, нужно 125. У вас: ${userStore.user?.energy ?? 0}`)
      userStore.fetchUser(userStore.user?.id) //TODO THINKING
      return
    }
    monsterStore.setSelectedMonster(monster.id)
    if (!monsterStore.selectedMonster) {
      setErrorMsg('Выберите питомца')
      return
    }
    if(monsterStore.selectedMonster.satiety < 25){
      setErrorMsg('Монстр голоден. Покорми!!!!')
      return
    }
    navigate('/search-battle')
  }

  const handleGoToCreateUser = () => {
    navigate('/create-user')
  }

  const handleSelectMonster = (monster: Monster) => {
    monsterStore.setSelectedMonster(monster.id)
  }

  const handleGoToMonsterMenu = (monster: Monster) => {
    if (!monster?.id) return
    navigate(`/monster-menu/${monster.id}`)
  }

  if (isLoading) {
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

  return (
    <div className={styles.laboratory}>
      <div className={styles.header}>
        <SecondButton onClick={() => navigate('/create-monster')}>Создать</SecondButton>
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
          text="Энергия"
          color="#61FFBE"
          backgroundColor="#94c9b3"
          width={120}
          height={48}
          onClick={() => console.log('Clicked!')}
        />
      </div>
      <div className={styles.wrapperCharacteristics}>
        <StatBarMain
          name={selectedMonster.name || '???'}
          level={selectedMonster.level}
          current={selectedMonster.experiencePoints ?? 0}
          max={selectedMonster.nextLevelExp}
          width={370}
          height={35}
        />
      </div>
      <div style={{ color: 'red' }}>{errorMsg}</div>
      {monsterStore.selectedMonster?.id === selectedMonster.id && (
        <div className={styles.activeText}>активный</div>
      )}
      <button onClick={() => handleSelectMonster(selectedMonster)}>Сделать основным</button>
      <MonsterAvatarWithShadow
        monster={selectedMonster}
        onClick={() => handleGoToMonsterMenu(selectedMonster)}
      />
      <div className={styles.selectMonsters}>
        <RoundButton onClick={handlePrevMonster} color="#D2FF49" />
        <MainButton onClick={() => handleGoToArena(selectedMonster)}>Арена</MainButton>
        <RoundButton onClick={handleNextMonster} type="next" color="#D2FF49" />
      </div>
      <div className={styles.bottomMenu}>
        <div className={styles.menuItem}>
          <img
            src={foodIcon}
            alt="food"
            className={styles.tabIconImage}
            onClick={() => {
              if (userStore.user?.id) {
                navigate(`/food-menu/${userStore.user.id}`)
              }
            }}
          />
        </div>
        <div className={styles.menuItem}>
          <img src={labIcon} alt="lab" className={styles.tabIconImage} />
        </div>
        <div className={styles.menuItem}>
          <img src={upgradeIcon} alt="upgrade" className={styles.tabIconImage} />
        </div>
        <div className={styles.menuItem}>
          <img src={socialIcon} alt="social" className={styles.tabIconImage} />
        </div>
      </div>
    </div>
  )
})

export default Laboratory
