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
import InfoPopupMutagen from './InfoPopupMutagen'
import { UserInventory } from '../../types/GraphResponse'
import HeaderBar from '../../components/Header/HeaderBar'

const MutagensMenu = observer(() => {
  const navigate = useNavigate()
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInventory, setSelectedInventory] = useState<UserInventory | null>(null)

  const fetchInventoriesAndMonsters = useCallback(
    async (withLoading: boolean) => {
      try {
        if (withLoading) setIsLoading(true)
        await authorizationAndInitTelegram(navigate)

        await inventoriesStore.fetchInventories()

        setIsLoading(false)
      } catch {
        setInfoMessage('Ошибка при загрузке')
        setIsLoading(false)
      }
    },
    [navigate],
  )

  const handlerApplyMutagen = (userInventory: UserInventory) => {
    navigate(`/monster-apply-mutagen/${userInventory.id}`)
  }

  const handlerShowInfoPopupMutagen = (item: UserInventory) => {
    setSelectedInventory(item)
  }

  const handlerSelectedMutagen = (item: UserInventory, idx: number) => {
    console.log('selected:', item, idx)
  }

  useEffect(() => {
    fetchInventoriesAndMonsters(true)
  }, [navigate, fetchInventoriesAndMonsters])

  if (isLoading && inventoriesStore.inventories.length === 0) {
    console.log('LODING!!!!!!!!!')
    return <Loading />
  }

  return (
    <div className={styles.mutagensMenu}>
      <HeaderBar
        icon={mutagenIcon}
        title={'Мутагены'}
        rightContent={<RoundButton type="exit" onClick={() => navigate('/laboratory')} />}
      />
      <div className={styles.content}>
        {infoMessage}
        <div className={styles.gridWrapper}>
          <MutagenGrid
            userInventories={inventoriesStore.inventories}
            onSelect={handlerSelectedMutagen}
            onDoubleClick={handlerShowInfoPopupMutagen}
          />
        </div>
        <div className={styles.bottomMenu}>
          <MainButton
            onClick={() => navigate('/laboratory')}
            color="black"
            backgroundColor="#FB6B6B"
          >
            Утилизировать
          </MainButton>
        </div>
        <InfoPopupMutagen
          userInventory={selectedInventory}
          onClose={() => setSelectedInventory(null)}
          onClick={handlerApplyMutagen}
        />
      </div>
    </div>
  )
})

export default MutagensMenu
