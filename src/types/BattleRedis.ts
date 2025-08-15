import { Skill } from './GraphResponse'

export interface MonsterStats {
  healthPoints: number
  stamina: number
  strength: number
  defense: number
  evasion: number
}

export interface LastActionLog {
  monsterId: string
  actionName: string
  damage: number
  stamina: number
}

export interface GetBattleReward {
  food?: {
    id: string
    name: string
    quantity: number
  }
  exp: number
  mutagen?: {
    id: string
    name: string
    quantity: number
  }
}

export interface BattleRedis {
  battleId: string
  opponentMonsterId: string
  challengerMonsterId: string

  challengerMonsterHp: number
  opponentMonsterHp: number

  challengerMonsterStamina: number
  opponentMonsterStamina: number

  challengerStats: MonsterStats
  opponentStats: MonsterStats

  challengerAttacks: Skill[]
  challengerDefenses: Skill[]
  opponentAttacks: Skill[]
  opponentDefenses: Skill[]

  currentTurnMonsterId: string
  turnStartTime: number
  turnTimeLimit: number
  turnNumber: number
  turnEndsAtMs: number
  graceMs: number
  serverNowMs: number
  lastActionLog?: LastActionLog

  challengerSocketId: string
  opponentSocketId: string
  challengerReady: '1' | '0'
  opponentReady: '1' | '0'
  winnerMonsterId?: string
  chatId?: string | null

  opponentGetReward?: GetBattleReward
  challengerGetReward?: GetBattleReward
}

export interface MonsterOpponent {
  monsterId: string
  socketId: string
  findOpponent: boolean
  name: string
  level: number
  avatar: string | null
}
