import { observer } from 'mobx-react-lite'
import { useNavigate, useParams } from 'react-router-dom'

import styles from './MonsterMenu.module.css'
import { useEffect, useState } from 'react'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import RoundButton from '../../components/Button/RoundButton'
import CharacteristicMonster from '../../components/CharacteristicMonster/CharacteristicMonster'
import StatBar from '../../components/StatBar/StatBar'
import monsterStore from '../../stores/MonsterStore'
import {
  Monster,
  MonsterApplyMutagenResponse,
  Skill,
  UserInventory,
} from '../../types/GraphResponse'
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
import { showTopAlert } from '../../components/TopAlert/topAlertBus'
import userStore from '../../stores/UserStore'

const MonsterMenu = observer(() => {
  const navigate = useNavigate()
  const { monsterIdParams, inventoryIdParams } = useParams()

  if (!monsterIdParams) {
    showTopAlert({ text: 'Выберите монстра', variant: 'warning', open: true })
    navigate('/laboratory')
    return
  }

  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(
    monsterStore.getMonsterById(monsterIdParams),
  )
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'skills' | 'mutagens'>('skills')
  const [animateIn, setAnimateIn] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState<UserInventory | null>(null)
  const [newCharMonster, setNewCharMonster] = useState<MonsterApplyMutagenResponse | null>(null)
  const [openPopupCardMutagen, setOpenPopupCardMutagen] = useState(false)
  const [openInfoPopupMutagen, setOpenInfoPopupMutagen] = useState(false)

  useEffect(() => {
    const starting = async () => {
      try {
        await authorizationAndInitTelegram(navigate)
        const monster = await monsterStore.fetchMonster(monsterIdParams)
        if (!monster) {
          showTopAlert({ text: 'Нету такого монстра', variant: 'warning', open: true })
          navigate('/laboratory')
        }
        setSelectedMonster(monster)
        setIsLoading(false)
      } catch {
        showTopAlert({ text: 'Ошибка при загрузке', variant: 'error', open: true })
      }

      if (inventoryIdParams) {
        setActiveTab('skills')
      }
    }

    starting()
  }, [monsterIdParams, navigate, inventoryIdParams])

  useEffect(() => {
    if (!isLoading) {
      setAnimateIn(true)
    }
  }, [isLoading])

  const ApplySkill = async (skill: Skill | null) => {
    if (inventoryIdParams && monsterIdParams) {
      try {
        await monsterStore.apllySkillToMonster(monsterIdParams, inventoryIdParams, skill?.id)
        navigate(`/skills-menu/${monsterIdParams}`)
      } catch {
        showTopAlert({ text: 'Ошибка при применении скилла', variant: 'error', open: true })
      }
    } else if (monsterIdParams) {
      navigate(`/skills-menu/${monsterIdParams}/${skill?.id || ''}`)
    }
  }

  useEffect(() => {
    if (selectedInventory?.mutagen) {
      setOpenInfoPopupMutagen(true)
    }
  }, [selectedInventory])

  if ((isLoading && !userStore.isAuthenticated) || !selectedMonster) {
    return <Loading />
  }

  const handlerApplyMutagen = async (userInventory: UserInventory) => {
    if (userInventory.userInventoryType === 'MUTAGEN') {
      try {
        const monsterApplyMutagen = await monsterStore.apllyMutagenToMonster(
          selectedMonster.id,
          userInventory.id || '',
        )
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
          showTopAlert({ text: 'Мутаген не найден', variant: 'warning', open: true })
        } else {
          showTopAlert({ text: 'Ошибка при мутации', variant: 'error', open: true })
        }
      }
    }
  }

  return (
    <div className={styles.MonsterMenu}>
      <div className={styles.header}>
        <div className={styles.left}>
          <CharacteristicMonster
            name={selectedMonster?.name || ''}
            level={selectedMonster?.level ?? 0}
            hp={selectedMonster?.healthPoints ?? 0}
            stamina={selectedMonster?.stamina ?? 0}
            defense={selectedMonster?.defense ?? 0}
            strength={selectedMonster?.strength ?? 0}
            evasion={selectedMonster?.evasion ?? 0}
          />
        </div>
        <div
          className={styles.center}
          onClick={() => {
            navigate(`/food-menu/${userStore.user?.id || ''}`)
          }}
        >
          <div className={styles.barWrapper}>
            <StatBar
              current={selectedMonster.satiety ?? 0}
              max={100}
              width={130}
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
      <div className={styles.centerWrapper}>
        <MonsterAvatarWithShadow
          monster={selectedMonster}
          onClick={() => {}}
          className={styles.avatarMobileContainer}
        />
      </div>
      <div className={clsx(styles.partSelectorWrapper, { [styles.visible]: animateIn })}>
        <PartSelectorMonsterMenu
          inventories={inventoriesStore.inventories}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSelectInventory={setSelectedInventory}
          onSelectedMonsterSkill={ApplySkill}
          monster={selectedMonster}
          applyInventoryId={inventoryIdParams}
        />
      </div>

      {openInfoPopupMutagen && (
        <InfoPopupMutagen
          userInventory={selectedInventory}
          onClose={() => {
            setSelectedInventory(null)
            setOpenInfoPopupMutagen(false)
          }}
          onClick={handlerApplyMutagen}
        />
      )}

      {openPopupCardMutagen && selectedMonster && (
        <PopupCardAppliedMutagen
          icon={selectedMonster.avatar || ''}
          title={selectedMonster.name || ''}
          subtitle={GetMonsterNewCharacteristicLines(newCharMonster)}
          onButtonClick={() => setOpenPopupCardMutagen(false)}
          onClose={() => {
            setOpenPopupCardMutagen(false)
          }}
          levelMonster={selectedMonster.level}
        />
      )}
    </div>
  )
})

export default MonsterMenu
