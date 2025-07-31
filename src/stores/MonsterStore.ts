import { makeAutoObservable, runInAction } from 'mobx'
import client from '../api/apolloClient'
import { MONSTER, MONSTERS } from '../api/graphql/query'
import userStore from './UserStore'
import { MONSTER_UPDATE } from '../api/graphql/mutation'
import { GraphQLListResponse, Monster } from '../types/GraphResponse'

class MonsterStore {
  monsters: Monster[] = []
  selectedMonster: Monster | null = null
  opponentMonster: Monster | null = null
  error: string | null = null
  isLoading: boolean = false

  constructor() {
    makeAutoObservable(this)
  }

  setMonsters(monsters: Monster[]) {
    this.monsters = monsters
  }

  setSelectedMonster(monsterId: string) {
    const monster = this.monsters.find((m) => m.id === monsterId)
    if (!monster) return

    this.monsters = this.monsters.map((m) => ({
      ...m,
      isSelected: m.id === monsterId,
    }))
    this.selectedMonster = monster

    client
      .mutate({
        mutation: MONSTER_UPDATE,
        variables: {
          id: monsterId,
          isSelected: true,
        },
      })
      .catch((err) => {
        console.error('Failed to update selected monster:', err)
      })
  }

  clearMonsters() {
    this.monsters = []
    this.selectedMonster = null
  }

  async fetchMonsters(userId = userStore.user?.id) {
    this.error = null
    this.isLoading = true

    try {
      const { data }: { data: { Monsters: GraphQLListResponse<Monster> } } = await client.query({
        query: MONSTERS,
        variables: {
          limit: 10,
          offset: 0,
          userId: { eq: userId },
        },
        fetchPolicy: 'no-cache',
      })

      runInAction(() => {
        const monstersWithAvatars = (data.Monsters.items || []).map((monster: Monster) => {
          const avatarFile = monster.files?.find((file) => file.contentType === 'AVATAR_MONSTER')
          return {
            ...monster,
            avatar: avatarFile?.url ?? undefined,
          }
        })

        this.monsters = monstersWithAvatars
        this.selectedMonster =
          monstersWithAvatars.length > 0
            ? monstersWithAvatars.find(
                (monster: Monster & { avatar?: string }) => monster.isSelected,
              ) || null
            : null
        this.isLoading = false
      })
    } catch (err: unknown) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : String(err)
        this.isLoading = false
      })
      console.error('Failed to fetch monsters:', err)
    }
  }

  setOpponentMonster(monster: Monster) {
    this.opponentMonster = monster
  }

  async fetchOpponentMonster(monsterId: string) {
    const { data }: { data: { Monster: Monster } } = await client.query({
      query: MONSTER,
      variables: {
        monsterId: monsterId,
      },
      fetchPolicy: 'no-cache',
    })

    const avatarFile = data.Monster.files?.find((file) => file.contentType === 'AVATAR_MONSTER')

    this.setOpponentMonster({ ...data.Monster, avatar: avatarFile?.url })
  }
}

const monsterStore = new MonsterStore()
export default monsterStore
