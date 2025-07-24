import * as gameDb from 'game-db'
import { UserInventoryTypeEnum } from './enums/UserInventoryTypeEnum'

export interface GraphQLListResponse<T> {
  totalCount: number
  items: T[]
}

export interface FileItem {
  id: string
  name: string
  version: number
  url: string
  description?: string
  fileType: gameDb.datatypes.FileTypeEnum
  contentType: gameDb.datatypes.ContentTypeEnum
  createdAt: string
}

export interface MonsterBattles {
  id: string
  challengerMonsterId: string
  opponentMonsterId: string
  winnerMonsterId: string
  status?: gameDb.datatypes.BattleStatusEnum
  log?: string
  updatedAt?: Date
  createdAt?: Date
}

export interface MonsterDefenses {
  id: number
  monsterId: string
  name: string
  modifier: number
  energyCost: number
  cooldown: number
}

export interface MonsterAttacks {
  id: number
  monsterId: string
  name: string
  modifier: number
  energyCost: number
  cooldown: number
}

export interface Monster {
  id: string
  name?: string
  level?: number
  nextLevelExp?: number
  isSelected?: boolean
  userId?: string
  files?: FileItem[]
  monsterDefenses: MonsterDefenses[]
  monsterAttacks: MonsterAttacks[]
  updatedAt?: Date
  createdAt?: Date
  avatar?: string
  healthPoints?: number
  stamina: number
  strength: number
  defense: number
  evasion: number
  experiencePoints: number
  lastFedAt: Date
  satiety: number
}

export interface Food {
  id: string
  name?: string
  description?: string
  iconFileId: string
  iconFile?: File
  satietyBonus: number
  updatedAt?: Date
  createdAt?: Date
}

export interface Mutagen {
  id: string
  name?: string
  description?: string
  effectDescription?: string
  iconFileId: string
  iconFile?: File
  updatedAt?: Date
  createdAt?: Date
}

export interface UserInventory {
  id: string
  userId: string
  //user: {}  TODO add user
  foodId: string
  food: Food
  mutagenId: string
  mutagen: Mutagen
  quantity: number
  type: UserInventoryTypeEnum
  updatedAt?: Date
  createdAt?: Date
}
