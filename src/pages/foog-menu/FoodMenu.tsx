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
import RoundButton from '../../components/Button/RoundButton'
import { ApolloError } from '@apollo/client'
import inventoriesStore from '../../stores/InventoriesStore'
import { UserInventoryTypeEnum } from '../../types/enums/UserInventoryTypeEnum'

const FoodMenu = observer(() => {
  const navigate = useNavigate()
  const { monsterIdParams } = useParams()
  const [infoMessage, setInfoMessage] = useState('')
  const [quantityFood, setQuantityFood] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchInventoriesAndMonsters = useCallback(
    async (withLoading: boolean) => {
      try {
        if (withLoading) setIsLoading(true)
        await authorizationAndInitTelegram(navigate)

        await inventoriesStore.fetchInventories()

        const totalFood = inventoriesStore.food.reduce((acc, item) => acc + (item.quantity ?? 0), 0)

        setQuantityFood(totalFood)

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

  const handlerFeedMonster = async (monsterId: string) => {
    const food = inventoriesStore.inventories.find(
      (inventory) => inventory?.quantity > 0 && inventory.type === UserInventoryTypeEnum.FOOD,
    )
    if (!food) {
      setInfoMessage('Нет еды для кормления')
      return
    }
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
        setInfoMessage('Монстр уже сыт')
      } else {
        setInfoMessage('Ошибка при кормлении')
      }
    }
  }

  return (
    <div className={styles.foodMenu}>
      <div className={styles.header}>
        <img className={styles.headerIcon} alt="food" src={foodIcon} />
        <div className={styles.headerTextBlock}>
          <span>Еда в наличии: {quantityFood}</span>
        </div>
        <div className={styles.headerButton}>
          <RoundButton type="exit" onClick={() => navigate('/laboratory')} />
        </div>
      </div>
      <div className={styles.content}>
        {infoMessage}
        {monsterStore.monsters.map((monster) => (
          <CardFeedMonster
            key={monster.id}
            url={monster?.avatar || ''}
            satiety={monster.satiety}
            onButtonClick={() => handlerFeedMonster(monster.id)}
          />
        ))}
        <div className={styles.bottomMenu}>
          <MainButton onClick={() => navigate('/laboratory')} height={93} backgroundColor="#616cff">
            Главное Меню
          </MainButton>
        </div>
      </div>
    </div>
  )
})

export default FoodMenu
