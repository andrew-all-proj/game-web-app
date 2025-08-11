import { observer } from 'mobx-react-lite'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import styles from './SkillMenu.module.css'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import Loading from '../loading/Loading'
import client from '../../api/apolloClient'
import upgradeIcon from '../../assets/icon/upgrade-icon.svg'
import monsterStore from '../../stores/MonsterStore'
import { USER_INVENTORY_DELETE } from '../../api/graphql/mutation'
import { ApolloError } from '@apollo/client'
import inventoriesStore from '../../stores/InventoriesStore'
import HeaderBar from '../../components/Header/HeaderBar'
import RoundButton from '../../components/Button/RoundButton'
import SimpleBar from 'simplebar-react'
import { UserInventory } from '../../types/GraphResponse'
import CardsSelectSkill from './CardsSelectSkill'
import PopupCard from '../../components/PopupCard/PopupCard'
import SelectMonster from './SelectMonster'
import InfoPopupSkill from './InfoPopupSkill'

const SkillMenu = observer(() => {
  const navigate = useNavigate()
  const { monsterIdParams } = useParams()
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInventory, setSelectedInventory] = useState<UserInventory | null>(null)
  const [openPopupCard, setOpenPopupCard] = useState(false)
  const [showSelectMonster, setShowSelectMonster] = useState(false)
  const [showInfoPopupSkill, setShowInfoPopupSkill] = useState(false)

  const fetchInventoriesAndMonsters = useCallback(
    async (withLoading: boolean) => {
      try {
        if (withLoading) setIsLoading(true)
        await authorizationAndInitTelegram(navigate)

        await inventoriesStore.fetchInventories()
        await monsterStore.fetchMonsters()

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
  }, [monsterIdParams, fetchInventoriesAndMonsters])

  if (isLoading && inventoriesStore.inventories.length === 0) {
    return <Loading />
  }

  const handlerDeleteMutagen = async (userInventory: UserInventory) => {
    try {
      await client.query({
        query: USER_INVENTORY_DELETE,
        variables: { userInventoryDeleteId: userInventory.id },
        fetchPolicy: 'no-cache',
      })
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
      if (message.includes('Skill not found in user inventory')) {
        setInfoMessage('Скилл не найден')
      } else {
        setInfoMessage('Ошибка при удаление скилла')
      }
    }
    setOpenPopupCard(false)
    setSelectedInventory(null)
  }

  return (
    <div className={styles.SkillMenu}>
      <HeaderBar
        icon={upgradeIcon}
        title={`Апгрейды`}
        rightContent={<RoundButton type="exit" onClick={() => navigate('/laboratory')} />}
      />
      {infoMessage}
      {showSelectMonster && selectedInventory ? (
        <SelectMonster
          monsters={monsterStore.monsters}
          selectedInventory={selectedInventory}
          onClose={() => setShowSelectMonster(false)}
        />
      ) : (
        <SimpleBar className={styles.scrollArea}>
          <CardsSelectSkill
            inventoriesStore={inventoriesStore.inventories}
            onSelectSkill={(inventory) => {
              setSelectedInventory(inventory)
              setShowInfoPopupSkill(true)
            }}
          />
        </SimpleBar>
      )}
      <InfoPopupSkill
        showInfoPopupSkill={showInfoPopupSkill}
        userInventory={selectedInventory}
        onClose={() => setShowInfoPopupSkill(false)}
        onClick={() => {
          setShowInfoPopupSkill(false)
          setShowSelectMonster(true)
        }}
        onClickDelete={() => setOpenPopupCard(true)}
      />
      {openPopupCard && selectedInventory && (
        <PopupCard
          title={`Утилизировать ${selectedInventory.skill?.name || 'апгрейд'}?`}
          subtitle={'Это действие нельзя отменить'}
          onClose={() => setOpenPopupCard(false)}
          onButtonClick={() => handlerDeleteMutagen(selectedInventory)}
        />
      )}
    </div>
  )
})

export default SkillMenu
