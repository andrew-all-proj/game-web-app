import { observer } from 'mobx-react-lite'
import { useNavigate, useParams } from 'react-router-dom'

import styles from './MonsterMenu.module.css'
import { useEffect, useState } from 'react'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import RoundButton from '../../components/Button/RoundButton'
import CharacteristicMonster from '../../components/CharacteristicMonster/CharacteristicMonster'
import StatBar from '../../components/StatBar/StatBar'
import monsterStore from '../../stores/MonsterStore'
import { Monster, MonsterApplyMutagenResponse, UserInventory } from '../../types/GraphResponse'
import Loading from '../loading/Loading'
import MonsterAvatarWithShadow from '../../components/MonsterAvatarWithShadow/MonsterAvatarWithShadow'
import foodIcon from '../../assets/icon/food-icon.svg'
import clsx from 'clsx'
import inventoriesStore from '../../stores/InventoriesStore'
import PartSelectorMonsterMenu from './PartSelectorMonsterMenu'
import InfoPopupMutagen from '../../components/InfoPopupMutagen/InfoPopupMutagen'
import { ApolloError } from '@apollo/client'
import PopupCardAppliedMutagen from '../../components/PopupCardAppliedMutagen/PopupCardAppliedMutagen'
import { GetMonsterNewCharacteristicLines } from '../../components/GetMonsterNewCharacteristicLines/GetMonsterNewCharacteristicLines'

const MonsterMenu = observer(() => {
  const navigate = useNavigate()
  const { monsterIdParams } = useParams()
  const [infoMessage, setInfoMessage] = useState('')
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'skills' | 'mutagens'>('skills')
  const [animateIn, setAnimateIn] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState<UserInventory | null>(null)
  const [newCharMonster, setNewCharMonster] = useState<MonsterApplyMutagenResponse | null>(null)
  const [openPopupCardMutagen, setOpenPopupCardMutagen] = useState(false)

  useEffect(() => {
    const starting = async () => {
      try {
        await authorizationAndInitTelegram(navigate)
        if(!monsterIdParams) {
          setInfoMessage('Ошибка')
          return
        }
        let monster = monsterStore.monsters.find((monster) => monster.id === monsterIdParams)
        if (!monster) {
          monster = await monsterStore.fetchMonster(monsterIdParams)
          if(monster) {
            setInfoMessage('Нету такого монстра')
          }
          setSelectedMonster(monster)
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

  const handlerApplyMutagen = async (userInventory: UserInventory) => {
    if(userInventory.userInventoryType !== 'MUTAGEN') {
      return
    }
     try {
      const monsterApplyMutagen = await monsterStore.apllyMutagenToMonster(selectedMonster.id, userInventory.id || '')
      setNewCharMonster(monsterApplyMutagen)
      setOpenPopupCardMutagen(true)
      setSelectedInventory(null)
      const monster = await monsterStore.fetchMonster(selectedMonster.id)
      setSelectedMonster(monster)
      await inventoriesStore.fetchInventories()
    } catch (error: unknown) {
      //TODO UPDATE ERROR
      let message = ''
      if (error instanceof ApolloError) {
        message =
          error.message || error.graphQLErrors?.[0]?.message || error.networkError?.message || ''
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        message = (error as { message: string }).message
      } else {
        message = String(error)
      }
      if (message.includes('Mutagen not found in user inventory')) {
        setInfoMessage('Мутаген не найден')
      } else {
        setInfoMessage('Ошибка при мутации')
      }
    }
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
            <StatBar
              current={selectedMonster.satiety ?? 0}
              max={100}
              width={100}
              height={32}
              color={'var(--orange-secondary-color)'}
              backgroundColor={'var(--orange-scale-hungry)'}
            />
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
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSelectInventory={setSelectedInventory}
        />
      </div>
        <InfoPopupMutagen
          userInventory={selectedInventory}
          onClose={() => setSelectedInventory(null)}
          onClick={handlerApplyMutagen}
        />
        {openPopupCardMutagen && selectedMonster && (
          <PopupCardAppliedMutagen
            icon={selectedMonster.avatar || ''}
            title={selectedMonster.name || ''}
            subtitle={GetMonsterNewCharacteristicLines(newCharMonster)}
            onButtonClick={() => setOpenPopupCardMutagen(false)}
            onClose={() => { setOpenPopupCardMutagen(false) }}
            levelMonster={selectedMonster.level}
        />
      )}
    </div>
  )
})

export default MonsterMenu
