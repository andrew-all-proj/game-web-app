import { observer } from 'mobx-react-lite'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import styles from './EnergyMenu.module.css'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import Loading from '../loading/Loading'
import mutagenIcon from '../../assets/icon/icon_mutagen.svg'
import MainButton from '../../components/Button/MainButton'
import { ApolloError } from '@apollo/client'
import inventoriesStore from '../../stores/InventoriesStore'
import HeaderBar from '../../components/Header/HeaderBar'
import RoundButton from '../../components/Button/RoundButton'
import userStore from '../../stores/UserStore'
import StatBarEnergy from '../../components/StatBar/StatBarEnergy/StatBarStatBarEnergy'
import CardsApplyEnergy from './CardsApplyEnergy'
import { UserInventory } from '../../types/GraphResponse'
import { showTopAlert } from '../../components/TopAlert/topAlertBus'

const EnergyMenu = observer(() => {
  const navigate = useNavigate()
  const { monsterIdParams } = useParams()
  const [isLoading, setIsLoading] = useState(true)

  const fetchInventories = useCallback(
    async (withLoading: boolean) => {
      try {
        if (withLoading) setIsLoading(true)
        await authorizationAndInitTelegram(navigate)
        await inventoriesStore.fetchInventories()
        await userStore.fetchUser()
        setIsLoading(false)
      } catch {
        showTopAlert({text: 'Ошибка при загрузке', variant: 'error'})
        setIsLoading(false)
      }
    },
    [navigate],
  )

  useEffect(() => {
    fetchInventories(true)
  }, [monsterIdParams, fetchInventories])

  if (isLoading && inventoriesStore.inventories.length === 0) {
    return <Loading />
  }

  const handlerApplyEnergy = async (inventory: UserInventory) => {
    try {
      await userStore.apllyEnergyToUser(inventory.id)
      await fetchInventories(false)
    } catch (error: unknown) {
      let message = ''
      if (error instanceof ApolloError) {
        message =
          error.message || error.graphQLErrors?.[0]?.message || error.networkError?.message || ''
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        message = (error as { message: string }).message
      } else {
        message = String(error)
      }
      if (message.includes('The monster is already full')) {
        showTopAlert({text: 'Монстр уже сыт', variant: 'info'})
      } else {
        showTopAlert({text: 'Ошибка при кормлении', variant: 'error'})
      }
    }
  }

  return (
    <div className={styles.foodMenu}>
      <HeaderBar
        icon={mutagenIcon}
        title={'Энергия'}
        rightContent={<RoundButton type="exit" onClick={() => navigate('/laboratory')} />}
      />
      <div className={styles.content}>
        <StatBarEnergy
          current={userStore.user?.energy || 0}
          max={1000}
          title={'Емкость энергоблока'}
        />
        <CardsApplyEnergy
          inventories={inventoriesStore.energies}
          onButtonClick={handlerApplyEnergy}
        />
        <div className={styles.bottomMenu}>
          <MainButton
            onClick={() => navigate('/laboratory')}
            height={93}
            backgroundColor="var(--red-primary-color)"
          >
            Приобрести
          </MainButton>
        </div>
      </div>
    </div>
  )
})

export default EnergyMenu
