import { makeAutoObservable, runInAction } from 'mobx'
import client from '../api/apolloClient'
import { USER_INVENTORY } from '../api/graphql/query'
import { GraphQLListResponse, UserInventory } from '../types/GraphResponse'
import { UserInventoryTypeEnum } from '../types/enums/UserInventoryTypeEnum'

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
    return this.inventories.filter((item) => item.type === UserInventoryTypeEnum.FOOD)
  }

  get mutagens() {
    return this.inventories.filter((item) => item.type === UserInventoryTypeEnum.MUTAGEN)
  }

  clear() {
    this.inventories = []
    this.error = null
    this.loading = false
  }
}

const inventoriesStore = new InventoriesStore()
export default inventoriesStore
