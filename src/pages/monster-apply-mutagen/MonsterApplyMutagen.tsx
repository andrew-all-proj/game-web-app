import { observer } from 'mobx-react-lite'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, useCallback, JSX } from 'react'
import styles from './MonsterApplyMutagen.module.css'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import Loading from '../loading/Loading'
import mutagenIcon from '../../assets/icon/icon_mutagen.svg'
import MainButton from '../../components/Button/MainButton'
import monsterStore from '../../stores/MonsterStore'
import RoundButton from '../../components/Button/RoundButton'
import inventoriesStore from '../../stores/InventoriesStore'
import { Monster, Mutagen, UserInventory } from '../../types/GraphResponse'
import HeaderBar from '../../components/Header/HeaderBar'
import CardMenuMonster from '../../components/CardMenuMonster/CardMenuMonster'
import client from '../../api/apolloClient'
import { MONSTER_APPLY_MUTAGEN } from '../../api/graphql/mutation'
import { ApolloError } from '@apollo/client'
import PopupCardApplyMutagen from './PopupCardApplyMutagen'

const MonsterApplyMutagen = observer(() => {
  const navigate = useNavigate()
  const { inventoryIdParams } = useParams()
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null)
  const [openPopupCard, setOpenPopupCard] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState<UserInventory | null>(null)

  const fetchInventoriesAndMonsters = useCallback(
    async (withLoading: boolean) => {
      try {
        if (withLoading) setIsLoading(true)
        await authorizationAndInitTelegram(navigate)

        const inventory = inventoriesStore.inventories.find(
          (inventory) => inventory.id === inventoryIdParams,
        )

        if (!inventory) {
          setInfoMessage('Не найден мутаген')
          setIsLoading(false)
          return
        }

        setSelectedInventory(inventory)
        setIsLoading(false)
      } catch {
        setInfoMessage('Ошибка при загрузке')
        setIsLoading(false)
      }
    },
    [navigate],
  )

  useEffect(() => {
    fetchInventoriesAndMonsters(true)
  }, [inventoryIdParams, fetchInventoriesAndMonsters])

  if (isLoading && inventoriesStore.inventories.length === 0) {
    return <Loading />
  }

  const handleOpenPopupCard = (monster: Monster) => {
    setSelectedMonster(monster)
    setOpenPopupCard(true)
  }

  const applyMutagenToMonster = async () => {
    try {
      await client.query({
        query: MONSTER_APPLY_MUTAGEN,
        variables: { monsterId: selectedMonster?.id, userInventoryId: selectedInventory?.id },
        fetchPolicy: 'no-cache',
      })
      navigate('/mutagens-menu')
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
    setOpenPopupCard(false)
  }

  const getMonsterCharacteristicLines = (
    monster: Monster,
    mutagen?: Mutagen,
  ): JSX.Element | null => {
    if (!mutagen) return null

    const lines: JSX.Element[] = []

    if (mutagen.defense) {
      lines.push(
        <div key="defense">
          Защита {monster.defense} ➡ {monster.defense + (mutagen.defense || 0)}
        </div>,
      )
    }
    if (mutagen.strength) {
      lines.push(
        <div key="strength">
          Сила {monster.strength} ➡ {monster.strength + (mutagen.strength || 0)}
        </div>,
      )
    }
    if (mutagen.evasion) {
      lines.push(
        <div key="evasion">
          Уклонение {monster.evasion} ➡ {monster.evasion + (mutagen.evasion || 0)}
        </div>,
      )
    }

    return lines.length > 0 ? <>{lines}</> : null
  }

  return (
    <div className={styles.foodMenu}>
      <HeaderBar
        icon={mutagenIcon}
        title={selectedInventory?.mutagen.name || ''}
        rightContent={<RoundButton type="exit" onClick={() => navigate('/laboratory')} />}
      />
      <div className={styles.content}>
        {infoMessage}
        {monsterStore.monsters.map((monster) => (
          <CardMenuMonster
            key={monster.id}
            url={monster?.avatar || ''}
            level={monster.level || 0}
            onButtonClick={() => handleOpenPopupCard(monster)}
            textButton={'Выбрать'}
          >
            <span>{monster.name}</span>
            {getMonsterCharacteristicLines(monster, selectedInventory?.mutagen)}
          </CardMenuMonster>
        ))}
        <div className={styles.bottomMenu}>
          <MainButton
            onClick={() => navigate('/mutagens-menu')}
            height={93}
            backgroundColor="var(--green-secondary-color)"
          >
            Мутагены
          </MainButton>
        </div>
      </div>
      {openPopupCard && selectedMonster && (
        <PopupCardApplyMutagen
          icon={selectedMonster.avatar || ''}
          title={selectedMonster.name || ''}
          subtitle={getMonsterCharacteristicLines(selectedMonster, selectedInventory?.mutagen)}
          onButtonClick={applyMutagenToMonster}
          onClose={() => setOpenPopupCard(false)}
          levelMonster={selectedMonster.level}
        />
      )}
    </div>
  )
})

export default MonsterApplyMutagen
