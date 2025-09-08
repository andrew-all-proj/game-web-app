// FoodMenu.tsx
import { observer } from 'mobx-react-lite'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import styles from './FoodMenu.module.css'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import Loading from '../loading/Loading'
import client from '../../api/apolloClient'
import foodIcon from '../../assets/icon/food-icon.svg'
import MainButton from '../../components/Button/MainButton'
import CardFeedMonster from './CardFeedMonster'
import monsterStore from '../../stores/MonsterStore'
import { MONSTER_FEED } from '../../api/graphql/mutation'
import { ApolloError } from '@apollo/client'
import inventoriesStore from '../../stores/InventoriesStore'
import { UserInventoryTypeEnum } from '../../types/enums/UserInventoryTypeEnum'
import HeaderBar from '../../components/Header/HeaderBar'
import { showTopAlert } from '../../components/TopAlert/topAlertBus'

const FoodMenu = observer(() => {
  const navigate = useNavigate()
  const { monsterIdParams } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [feedingIds, setFeedingIds] = useState<Set<string>>(new Set())

  const fetchInventoriesAndMonsters = useCallback(
    async (withLoading: boolean) => {
      try {
        if (withLoading) setIsLoading(true)
        await authorizationAndInitTelegram(navigate)

        await inventoriesStore.fetchInventories()
        await monsterStore.fetchMonsters()

        setIsLoading(false)
      } catch {
        showTopAlert({ open: true, text: 'Ошибка при загрузке', variant: 'error' })
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

  const handlerFeedMonster = async (monsterId: string) => {
    if (feedingIds.has(monsterId)) return

    const food = inventoriesStore.inventories.find(
      (inventory) =>
        inventory?.quantity > 0 && inventory.userInventoryType === UserInventoryTypeEnum.FOOD,
    )
    if (!food) {
      showTopAlert({ text: 'Нет еды для кормления', open: true, variant: 'warning' })
      return
    }

    setFeedingIds((prev) => new Set(prev).add(monsterId))

    try {
      await client.query({
        query: MONSTER_FEED,
        variables: { monsterId, quantity: 1, userInventoryId: food.id },
        fetchPolicy: 'no-cache',
      })
      await fetchInventoriesAndMonsters(false)
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
        showTopAlert({ text: 'Монстр уже сыт', open: true, variant: 'info' })
      } else {
        showTopAlert({ text: 'Ошибка при кормлении', open: true, variant: 'error' })
      }
    } finally {
      setFeedingIds((prev) => {
        const next = new Set(prev)
        next.delete(monsterId)
        return next
      })
    }
  }

  return (
    <div className={styles.foodMenu}>
      <HeaderBar icon={foodIcon} title={`Еда в наличии: ${inventoriesStore.quantityFood}`} />
      <div className={styles.content}>
        {monsterStore.monsters.map((monster) => {
          const isFeeding = feedingIds.has(monster.id)
          return (
            <CardFeedMonster
              key={monster.id}
              url={monster?.avatar || ''}
              satiety={monster.satiety}
              disabled={isFeeding}
              onButtonClick={() => !isFeeding && handlerFeedMonster(monster.id)}
            />
          )
        })}
        <div className={styles.bottomMenu}>
          <MainButton
            onClick={() => navigate('/laboratory')}
            height={93}
            backgroundColor="var(--blue-primary-color)"
          >
            Главное Меню
          </MainButton>
        </div>
      </div>
    </div>
  )
})

export default FoodMenu
