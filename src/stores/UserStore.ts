import { makeAutoObservable } from 'mobx'
import client from '../api/apolloClient'
import { USER_LOGIN } from '../api/graphql/mutation'

export interface User {
  id: string
  name: string
  token?: string
  nameProfessor?: string
  isRegistered?: boolean
  avatar?: { id: string; url: string } | null
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
