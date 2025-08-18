import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import styles from './MutagensMenu.module.css'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import Loading from '../loading/Loading'
import mutagenIcon from '../../assets/icon/icon_mutagen.svg'
import MainButton from '../../components/Button/MainButton'
import RoundButton from '../../components/Button/RoundButton'
import MutagenGrid from './MutagenGrid'
import inventoriesStore from '../../stores/InventoriesStore'
import InfoPopupMutagen from '../../components/InfoPopupMutagen/InfoPopupMutagen'
import { UserInventory } from '../../types/GraphResponse'
import HeaderBar from '../../components/Header/HeaderBar'
import client from '../../api/apolloClient'
import { ApolloError } from '@apollo/client'
import { USER_INVENTORY_DELETE } from '../../api/graphql/mutation'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import '../../assets/styles/simplebar-overrides.css'
import PopupCard from '../../components/PopupCard/PopupCard'
import { showTopAlert } from '../../components/TopAlert/topAlertBus'

const MutagensMenu = observer(() => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInventory, setSelectedInventory] = useState<UserInventory | null>(null)
  const [openPopupCard, setOpenPopupCard] = useState(false)
  const [inventoryToDelete, setInventoryToDelete] = useState<UserInventory | null>(null)

  const fetchInventoriesAndMonsters = useCallback(
    async (withLoading: boolean) => {
      try {
        if (withLoading) setIsLoading(true)
        await authorizationAndInitTelegram(navigate)

        await inventoriesStore.fetchInventories()

        setIsLoading(false)
      } catch {
        showTopAlert({text: 'Ошибка при загрузке', variant: 'error', open: true})
        setIsLoading(false)
      }
    },
    [navigate],
  )

  useEffect(() => {
    fetchInventoriesAndMonsters(true)
  }, [navigate, fetchInventoriesAndMonsters])

  if (isLoading && inventoriesStore.inventories.length === 0) {
    return <Loading />
  }

  const handlerApplyMutagen = (userInventory: UserInventory) => {
    navigate(`/monster-apply-mutagen/${userInventory.id}`)
  }

  const handlerShowInfoPopupMutagen = (item: UserInventory) => {
    setSelectedInventory(item)
  }

  const handlerSelectedMutagen = (item: UserInventory) => {
    setInventoryToDelete(item)
  }

  const showPopupCard = () => {
    if (!inventoryToDelete) {
      showTopAlert({text: 'Выберите мутаген для утилизации!', variant: 'info', open: true})
      return
    }
    setInventoryToDelete(inventoryToDelete)
    setOpenPopupCard(true)
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
      if (message.includes('Mutagen not found in user inventory')) {
        showTopAlert({text: 'Мутаген не найден', variant: 'warning', open: true} )
      } else {
        showTopAlert({text: 'Ошибка при мутации', variant: 'error', open: true})
      }
    }
    setOpenPopupCard(false)
    setInventoryToDelete(null)
    setSelectedInventory(null)
  }

  return (
    <div className={styles.mutagensMenu}>
      <HeaderBar
        icon={mutagenIcon}
        title={'Мутагены'}
        rightContent={<RoundButton type="exit" onClick={() => navigate('/laboratory')} />}
      />
      <div className={styles.content}>
        <SimpleBar className={styles.scrollArea}>
          <MutagenGrid
            userInventories={inventoriesStore.inventories}
            onSelect={handlerShowInfoPopupMutagen}
            onDoubleClick={handlerSelectedMutagen}
          />
        </SimpleBar>
        <div className={styles.bottomMenu}>
          <MainButton onClick={showPopupCard} color="black" backgroundColor="#FB6B6B">
            Утилизировать
          </MainButton>
        </div>
        <InfoPopupMutagen
          userInventory={selectedInventory}
          onClose={() => setSelectedInventory(null)}
          onClick={handlerApplyMutagen}
        />
        {openPopupCard && inventoryToDelete && (
          <PopupCard
            title={`Утилизировать ${inventoryToDelete.mutagen?.name || 'мутаген'}?`}
            subtitle={'Это действие нельзя отменить'}
            onClose={() => setOpenPopupCard(false)}
            onButtonClick={() => handlerDeleteMutagen(inventoryToDelete)}
          />
        )}
      </div>
    </div>
  )
})

export default MutagensMenu
