import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import userStore from '../../stores/UserStore'
import { useNavigate } from 'react-router-dom'

import styles from './Laboratory.module.css'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import Loading from '../loading/Loading'
import monsterStore from '../../stores/MonsterStore'
import noAvatarMonster from '../../assets/images/no-avatar-monster.jpg'
import MainButton from '../../components/Button/MainButton'
import NotFoundMonsters from './NotFoundMonsters'
import SecondButton from '../../components/Button/SecondButton'
import levelLifeIcon from '../../assets/icon/level-life.svg'
import foodIcon from '../../assets/icon/icon_food.svg'
import levelHitIcon from '../../assets/icon/level-hit-icon.svg'
import energyIcon from '../../assets/icon/energy-icon.svg'
import labIcon from '../../assets/icon/icon_lab.svg'
import upgradeIcon from '../../assets/icon/icon_upgrade.svg'
import socialIcon from '../../assets/icon/icon_social.svg'
import TriangleButton from '../../components/Button/TriangleButton'
import { Monster } from '../../types/GraphResponse'

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
      }
      setIsLoading(false)
    })()
  }, [navigate])

  const handleGoToArena = (monster: Monster) => {
    monsterStore.setSelectedMonster(monster.id)
    if (!monsterStore.selectedMonster) {
      setErrorMsg('Выберите питомца')
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
        <SecondButton onClick={() => {}}>Энергия</SecondButton>
        <div className={styles.avatarWrapper} onClick={handleGoToCreateUser}>
          <img alt="avatar user" src={userStore.user?.avatar?.url} />
        </div>
        <SecondButton onClick={() => navigate('/create-monster')}>Создать</SecondButton>
      </div>
      <div className={styles.wrapperCharacteristics}>
        <div className={styles.characteristic}>Lvl. {selectedMonster.level}</div>
        <div className={styles.characteristic}>
          <img alt="level-life" src={levelLifeIcon} />
        </div>
      </div>
      <div className={styles.wrapperCharacteristics}>
        <div className={styles.characteristic}>
          <img alt="energy" src={energyIcon} />
        </div>
        <div className={styles.characteristic}>
          <img alt="hit" src={levelHitIcon} />
        </div>
      </div>
      <div style={{ color: 'red' }}>{errorMsg}</div>
      <div>{selectedMonster.name}</div>
      {monsterStore.selectedMonster?.id === selectedMonster.id && (
        <div className={styles.activeText}>активный</div>
      )}
      <div className={styles.wrapperMonster} onClick={() => handleSelectMonster(selectedMonster)}>
        <img
          src={selectedMonster.avatar || noAvatarMonster}
          alt={selectedMonster.name}
          className={styles.petImage}
        />
      </div>
      <div className={styles.dotWrapper}>
        <div className={styles.outerDot}>
          <div className={styles.innerDot}></div>
        </div>
      </div>
      <div className={styles.selectMonsters}>
        <TriangleButton rotate={0} onClick={handlePrevMonster} />
        <MainButton onClick={() => handleGoToArena(selectedMonster)}>Арена</MainButton>
        <TriangleButton rotate={180} onClick={handleNextMonster} />
      </div>
      <div className={styles.bottomMenu}>
        <div className={styles.menuItem}>
          <img src={foodIcon} alt="food" className={styles.tabIconImage} />
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
