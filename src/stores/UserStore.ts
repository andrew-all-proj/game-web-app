import { makeAutoObservable } from 'mobx'
import client from '../api/apolloClient'
import { USER_LOGIN } from '../api/graphql/mutation'
import { USER } from '../api/graphql/query'

export interface User {
  id: string
  name: string
  token?: string
  nameProfessor?: string
  isRegistered?: boolean
  avatar?: { id: string; url: string } | null
  energy?: number
}

export type TelegramUser = {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  added_to_attachment_menu?: boolean
  allows_write_to_pm?: boolean
}

class UserStore {
  user: User | null = null

  constructor() {
    makeAutoObservable(this)
  }

  async fetchUser(id = this.user?.id): Promise<User | null> {
    try {
      const response = await client.query({
        query: USER,
        variables: {
          id,
        },
        fetchPolicy: 'no-cache',
      })

      const user = response.data?.User

      if (!user) {
        return null
      }

      const transformedUser: User = {
        id: user.id,
        name: user.name,
        nameProfessor: user.nameProfessor,
        avatar: user.avatar ? { id: user.avatar.id, url: user.avatar.url } : null,
        energy: user.energy,
        isRegistered: user.isRegistered,
        token: this.user?.token,
      }

      this.setUser(transformedUser)
      return transformedUser
    } catch (error) {
      console.error('Failed to fetch user:', error)
      return null
    }
  }

  async loginUser(initData: string, tgUser: TelegramUser): Promise<User | null> {
    const response = await client.mutate({
      mutation: USER_LOGIN,
      variables: {
        initData,
        telegramId: String(tgUser.id),
      },
    })

    const user = response.data?.UserLogin

    if (!user?.id) {
      return null
    }

    this.setUser({
      id: user.id,
      name: tgUser.first_name || tgUser.username || 'Unknown',
      nameProfessor: user.nameProfessor || tgUser.first_name || tgUser.username || 'Unknown',
      token: user.token,
      isRegistered: user.isRegistered,
      avatar: user.avatar ? { id: user.avatar.id, url: user.avatar.url } : null,
      energy: user.energy || 0,
    })

    return user
  }

  setUser(user: User) {
    this.user = user
  }

  clearUser() {
    this.user = null
  }

  get isAuthenticated() {
    return this.user?.token
  }
}

const userStore = new UserStore()
export default userStore
