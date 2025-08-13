import * as gameDb from 'game-db'
import { UserInventoryTypeEnum } from './enums/UserInventoryTypeEnum'
import { SkillRarity } from './enums/SkillRarity'
import { SkillType } from './enums/SkillType'

export interface GraphQLListResponse<T> {
  totalCount: number
  items: T[]
}

export interface File {
  url: string
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

export interface CommonResponse {
  CommonResponse: boolean
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
  skillId: string
  skill: Skill
}

export interface MonsterAttacks {
  id: number
  monsterId: string
  skillId: string
  skill: Skill
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
  strength: number
  defense: number
  evasion: number
  iconFileId: string
  iconFile?: File
  updatedAt?: Date
  createdAt?: Date
}

export interface SkillBonusEffect {
  restoreSp?: {
    value: number
  }
  immuneEffects?: boolean
  loseSp?: {
    value: number
  }
  reduceEvaEnemyNextTurn?: {
    value: number
  }
  increaseAccuracy?: {
    percent: number
    duration: number
  }
  ignoreDefPercent?: {
    percent: number
  }
  restoreSpOnHit?: {
    value: number
  }
  decreaseAccuracyNextTurn?: {
    percent: number
    duration: number
  }
  stunChance?: {
    percent: number
  }
}

export interface Skill {
  id: string
  name?: string
  description?: string
  strength?: number
  defense: number
  evasion: number
  energyCost: number
  cooldown: number
  isBase: boolean
  rarity: SkillRarity
  type: SkillType
  effects: SkillBonusEffect
  iconFileId: string
  iconFile?: File
}

export interface Energy {
  id: string
  name?: string
  quantity?: number
  priceMinor?: number
  isActive: boolean
}

export interface UserInventory {
  id: string
  userId: string
  //user: {}  TODO add user
  foodId: string
  food: Food
  mutagenId: string
  mutagen: Mutagen
  skillId: string
  skill: Skill
  energyId: string
  energy: Energy
  quantity: number
  userInventoryType: UserInventoryTypeEnum
  updatedAt?: Date
  createdAt?: Date
}

export interface MonsterApplyMutagenResponse {
  monsterId: string
  strength: number
  defense: number
  evasion: number
  oldStrength: number
  oldDefense: number
  oldEvasion: number
}
