import * as gameDb from 'game-db'

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

export interface Monster {
  id: string
  name?: string
  bodyMass?: number
  level?: number
  isSelected?: boolean
  userId?: string
  files?: FileItem[]
  updatedAt?: Date
  createdAt?: Date
  avatar?: string
}
