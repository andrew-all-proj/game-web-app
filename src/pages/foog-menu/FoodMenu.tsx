import { observer } from 'mobx-react-lite'
import { useNavigate, useParams } from 'react-router-dom'

import styles from './FoodMenu.module.css'
import { useEffect, useState } from 'react'
import { authorizationAndInitTelegram } from '../../functions/authorization-and-init-telegram'
import Loading from '../loading/Loading'
import { USER_INVENTORY } from '../../api/graphql/query'
import client from '../../api/apolloClient'
import { GraphQLListResponse, UserInventory } from '../../types/GraphResponse'
import { UserInventoryTypeEnum } from '../../types/enums/UserInventoryTypeEnum'
import foodIcon from '../../assets/icon/food-icon.svg'
import MainButton from '../../components/Button/MainButton'
import CardFeedMonster from './CardFeedMonster'
import monsterStore from '../../stores/MonsterStore'
import { MONSTER_FEED } from '../../api/graphql/mutation'
import RoundButton from '../../components/Button/RoundButton'

const FoodMenu = observer(() => {
  const navigate = useNavigate()
  const { monsterIdParams } = useParams()
  const [infoMessage, setInfoMessage] = useState('')
  const [quantityFood, setQuantityFood] = useState(0)
  const [userInventories, setUserInventories] = useState<{ foodId: string; quantity: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchInventoriesAndMonsters = async (withLoading: boolean) => {
    try {
      if (withLoading) setIsLoading(true)
      await authorizationAndInitTelegram(navigate)

      const { data }: { data: { UserInventories: GraphQLListResponse<UserInventory> } } =
        await client.query({
          query: USER_INVENTORY,
          variables: { limit: 10, offset: 0, type: { eq: UserInventoryTypeEnum.FOOD } },
          fetchPolicy: 'no-cache',
        })

      const totalFood = data.UserInventories.items.reduce(
        (acc, item) => acc + (item.quantity ?? 0),
        0,
      )

      const foods = data.UserInventories.items.map((food) => ({
        foodId: food.id,
        quantity: food.quantity,
      }))

      setUserInventories(foods)
      setQuantityFood(totalFood)

      await monsterStore.fetchMonsters()

      setIsLoading(false)
    } catch {
      setInfoMessage('Ошибка при загрузке')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInventoriesAndMonsters(true)
  }, [monsterIdParams, navigate])

  if (isLoading) {
    return <Loading />
  }

  const handlerFeedMonster = async (monsterId: string) => {
    const food = userInventories.find((food) => food?.quantity > 0)
    if (!food) {
      setInfoMessage('Нет еды для кормления')
      return
    }
    try {
      await client.query({
        query: MONSTER_FEED,
        variables: { monsterId, quantity: 1, userInventoryId: food.foodId },
        fetchPolicy: 'no-cache',
      })
      await fetchInventoriesAndMonsters(false)
    } catch (error: any) {
      console.log(error)
      const message =
        error?.message ||
        error?.graphQLErrors?.[0]?.message ||
        error?.networkError?.result?.errors?.[0]?.message ||
        error?.toString() ||
        ''
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
          <span>Еда в наличии:</span>
          <span>{quantityFood}</span>
        </div>
        <div className={styles.headerButton}>
          <RoundButton type="exit" onClick={() => navigate('/laboratory')} />
        </div>
      </div>
      <div className={styles.content}>
        {infoMessage}
        <div>
          {monsterStore.monsters.map((monster) => (
            <CardFeedMonster
              key={monster.id}
              url={monster?.avatar || ''}
              satiety={monster.satiety}
              onButtonClick={() => handlerFeedMonster(monster.id)}
            />
          ))}
        </div>
        <MainButton
          onClick={() => navigate('/laboratory')}
          height={93}
          width={300}
          backgroundColor="#616cff"
        >
          Главное Меню
        </MainButton>
      </div>
    </div>
  )
})

export default FoodMenu
