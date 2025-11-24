import { makeAutoObservable, runInAction } from 'mobx'
import client from '../api/apolloClient'
import { GET_FOOD_TODAY, SKILL, USER_INVENTORY } from '../api/graphql/query'
import { GetFoodToday, GraphQLListResponse, Skill, UserInventory } from '../types/GraphResponse'
import { UserInventoryTypeEnum } from '../types/enums/UserInventoryTypeEnum'
import userStore from './UserStore'

class InventoriesStore {
  inventories: UserInventory[] = []
  loading: boolean = false
  error: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  async fetchInventories(type?: UserInventoryTypeEnum) {
    this.loading = true
    this.error = null
    try {
      let requestType = {}
      if (type) {
        requestType = { type: { eq: type } }
      }
      const { data }: { data: { UserInventories: GraphQLListResponse<UserInventory> } } =
        await client.query({
          query: USER_INVENTORY,
          variables: { limit: 10, offset: 0, ...requestType },
          fetchPolicy: 'no-cache',
        })

      runInAction(() => {
        this.inventories = data?.UserInventories.items || []
        this.loading = false
      })
    } catch {
      runInAction(() => {
        this.error = 'Error loading inventories'
        this.loading = false
      })
    }
  }

  get food() {
    return this.inventories.filter((item) => item.userInventoryType === UserInventoryTypeEnum.FOOD)
  }

  get mutagens() {
    return this.inventories.filter(
      (item) => item.userInventoryType === UserInventoryTypeEnum.MUTAGEN,
    )
  }

  get skills() {
    return this.inventories.filter((item) => item.userInventoryType === UserInventoryTypeEnum.SKILL)
  }

  get energies() {
    return this.inventories.filter(
      (item) => item.userInventoryType === UserInventoryTypeEnum.ENERGY,
    )
  }

  get quantityFood() {
    return this.food.reduce((acc, item) => acc + (item.quantity ?? 0), 0)
  }

  async fetchSkillById(id: string): Promise<Skill | null> {
    try {
      const { data }: { data: { Skill: Skill } } = await client.query({
        query: SKILL,
        variables: { id },
        fetchPolicy: 'no-cache',
      })
      return data.Skill
    } catch {
      return null
    }
  }

  async fetchGetFood(): Promise<GetFoodToday> {
    try {
      const { data }: { data: { GetFoodToday: GetFoodToday } } = await client.query({
        query: GET_FOOD_TODAY,
        variables: { userId: userStore.user?.id },
        fetchPolicy: 'no-cache',
      })

      const reward = data.GetFoodToday

      return reward
    } catch {
      return { quantity: 0, message: 'Ошибка запроса' }
    }
  }

  clear() {
    this.inventories = []
    this.error = null
    this.loading = false
  }
}

const inventoriesStore = new InventoriesStore()
export default inventoriesStore
