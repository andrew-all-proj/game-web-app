import { observer } from 'mobx-react-lite'
import { useNavigate, useParams } from 'react-router-dom'

import styles from './MonsterMenu.module.css'
import { useEffect, useState } from 'react'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import RoundButton from '../../components/Button/RoundButton'
import CharacteristicMonster from '../../components/CharacteristicMonster/CharacteristicMonster'
import StatBar from '../../components/StatBar/StatBar'
import monsterStore from '../../stores/MonsterStore'
import { Monster, UserInventory } from '../../types/GraphResponse'
import client from '../../api/apolloClient'
import { MONSTER } from '../../api/graphql/query'
import Loading from '../loading/Loading'
import MonsterAvatarWithShadow from '../../components/MonsterAvatarWithShadow/MonsterAvatarWithShadow'
import foodIcon from '../../assets/icon/food-icon.svg'
import clsx from 'clsx'
import inventoriesStore from '../../stores/InventoriesStore'
import PartSelectorMonsterMenu from './PartSelectorMonsterMenu'

const MonsterMenu = observer(() => {
  const navigate = useNavigate()
  const { monsterIdParams } = useParams()
  const [infoMessage, setInfoMessage] = useState('')
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'skills' | 'mutagens'>('skills')
  const [animateIn, setAnimateIn] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const starting = async () => {
      try {
        await authorizationAndInitTelegram(navigate)

        const monster = monsterStore.monsters.find((monster) => monster.id === monsterIdParams)
        if (!monster) {
          const { data }: { data: { Monster: Monster } } = await client.query({
            query: MONSTER,
            variables: { monsterId: monsterIdParams },
            fetchPolicy: 'no-cache',
          })

          if (!data.Monster) {
            setInfoMessage('Монстер не наден')
            return
          }
          data.Monster.avatar = data.Monster.files?.find(
            (file) => file.contentType === 'AVATAR_MONSTER',
          )?.url
          setSelectedMonster(data.Monster)
        } else {
          setSelectedMonster(monster)
        }
        setIsLoading(false)
      } catch {
        setInfoMessage('Ошибка при загрузке')
      }
    }

    starting()
  }, [monsterIdParams, navigate])

  useEffect(() => {
    if (!isLoading) {
      setAnimateIn(true)
    }
  }, [isLoading])

  if (isLoading || !selectedMonster) {
    return <Loading />
  }

  return (
    <div className={styles.MonsterMenu}>
      <div className={styles.header}>
        <div className={styles.left}>
          <CharacteristicMonster
            level={selectedMonster?.level ?? 0}
            hp={selectedMonster?.healthPoints ?? 0}
            stamina={selectedMonster?.stamina ?? 0}
            defense={selectedMonster?.defense ?? 0}
            strength={selectedMonster?.strength ?? 0}
            evasion={selectedMonster?.evasion ?? 0}
          />
        </div>
        <div className={styles.center}>
          <div className={styles.barWrapper}>
            <StatBar current={selectedMonster.satiety ?? 0} max={100} width={100} height={32} />
            <img src={foodIcon} alt="food" className={styles.icon} />
          </div>
        </div>
        <div className={styles.right}>
          <RoundButton
            onClick={() => navigate('/laboratory')}
            type="exit"
            className={styles.exitButton}
          />
        </div>
      </div>

      {infoMessage}

      <div className={styles.centerWrapper}>
        <MonsterAvatarWithShadow
          monster={selectedMonster}
          onClick={() => {}}
          className={styles.avatarMobileContainer}
        />
      </div>

      <div className={clsx(styles.partSelectorWrapper, { [styles.visible]: animateIn })}>
        <PartSelectorMonsterMenu
          inventory={inventoriesStore.inventories}
          rows={2}
          columns={3}
          activeTab={activeTab}                
          onTabChange={setActiveTab}
          setIsEditing={setIsEditing}
          onSelectInventory={(inv) =>  {}}
        />
      </div>
    </div>
  )
})

export default MonsterMenu
