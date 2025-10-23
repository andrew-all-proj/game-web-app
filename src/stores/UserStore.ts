import { makeAutoObservable } from 'mobx'
import client from '../api/apolloClient'
import { USER_APPLY_ENERGY, USER_LOGIN, USER_UPDATE } from '../api/graphql/mutation'
import { USER } from '../api/graphql/query'
import socketStore from './SocketStore'
import { CommonResponse } from '../types/GraphResponse'

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

export type UserSelectedPartsInput = {
  bodyPartId: number
  headPartId: number
  emotionPartId: number
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
        variables: { id },
        fetchPolicy: 'no-cache',
      })
      const user = response.data?.User
      if (!user) return null

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
    if (!user?.id) return null

    this.setUser({
      id: user.id,
      name: tgUser.first_name || tgUser.username || 'Unknown',
      nameProfessor: user.nameProfessor || tgUser.first_name || tgUser.username || 'Unknown',
      token: user.token,
      isRegistered: user.isRegistered,
      avatar: user.avatar ? { id: user.avatar.id, url: user.avatar.url } : null,
      energy: user.energy || 0,
    })

    if (user.token) {
      socketStore.init(user.token)
    }

    return user
  }

  async updateUserProfile(args: {
    nameProfessor?: string
    isRegistered?: boolean
    avatarFileId?: string | null
    userSelectedParts?: UserSelectedPartsInput | null
  }): Promise<User | null> {
    if (!this.user?.id) return null

    const variables: Record<string, any> = {
      id: this.user.id,
      ...(args.nameProfessor !== undefined && { nameProfessor: args.nameProfessor }),
      ...(args.isRegistered !== undefined && { isRegistered: args.isRegistered }),
      ...(args.avatarFileId !== undefined && { avatarFileId: args.avatarFileId }),
      ...(args.userSelectedParts !== undefined && { userSelectedParts: args.userSelectedParts }),
    }

    const { data } = await client.mutate({
      mutation: USER_UPDATE,
      variables,
    })

    const updated = data?.UserUpdate
    if (!updated) return null

    const transformed: User = {
      id: updated.id,
      name: updated.name,
      nameProfessor: updated.nameProfessor,
      isRegistered: updated.isRegistered,
      avatar: updated.avatar ? { id: updated.avatar.id, url: updated.avatar.url } : null,
      energy: this.user?.energy,
      token: this.user?.token,
    }
    this.setUser(transformed)
    return transformed
  }

  apllyEnergyToUser = async (userInventoryId: string): Promise<CommonResponse> => {
    const { data }: { data: { UserApplyEnergy: CommonResponse } } = await client.query({
      query: USER_APPLY_ENERGY,
      variables: { userId: this.user?.id, userInventoryId },
      fetchPolicy: 'no-cache',
    })
    return data.UserApplyEnergy
  }

  setUser(user: User) {
    this.user = user
  }

  clearUser() {
    this.user = null
  }

  get isAuthenticated() {
    return !!this.user?.token
  }
}

const userStore = new UserStore()
export default userStore
