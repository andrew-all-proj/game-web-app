import { gql } from '@apollo/client'

export const FILES = gql`
  query Files($limit: Float!, $offset: Float!, $contentType: ContentTypeEnum) {
    Files(limit: $limit, offset: $offset, contentType: { eq: $contentType }) {
      totalCount
      items {
        id
        name
        version
        url
        description
        fileType
        contentType
        createdAt
      }
    }
  }
`

export const MONSTERS = gql`
  query Monsters($limit: Float!, $offset: Float!, $userId: UuidFilter) {
    Monsters(limit: $limit, offset: $offset, userId: $userId) {
      totalCount
      items {
        createdAt
        defense
        evasion
        experiencePoints
        healthPoints
        id
        isSelected
        level
        name
        stamina
        strength
        updatedAt
        userId
        files {
          contentType
          fileType
          id
          url
          version
        }
        monsterAttacks {
          cooldown
          energyCost
          id
          modifier
          monsterId
          name
        }
        monsterDefenses {
          cooldown
          energyCost
          id
          modifier
          monsterId
          name
        }
      }
    }
  }
`

export const MONSTER = gql`
  query Monster($monsterId: String!) {
    Monster(id: $monsterId) {
      createdAt
      defense
      evasion
      experiencePoints
      healthPoints
      id
      isSelected
      level
      name
      stamina
      strength
      updatedAt
      userId
      files {
        contentType
        fileType
        id
        url
        version
      }
      monsterAttacks {
        cooldown
        energyCost
        id
        modifier
        monsterId
        name
      }
      monsterDefenses {
        cooldown
        energyCost
        id
        modifier
        monsterId
        name
      }
    }
  }
`

export const MONSTER_BATTLE = gql`
  query MonsterBattle($monsterBattleId: String!) {
    MonsterBattle(id: $monsterBattleId) {
      challengerMonsterId
      createdAt
      id
      log {
        from
        to
        action
        damage
        timestamp
      }
      opponentMonsterId
      status
      updatedAt
      winnerMonsterId
    }
  }
`

export const MONSTER_BATTLES = gql`
  query MonsterBattles($limit: Float!, $offset: Float!, $status: BattleStatusFilter) {
    MonsterBattles(limit: $limit, offset: $offset, status: $status) {
      items {
        id
        challengerMonsterId
        opponentMonsterId
        winnerMonsterId
        status
        createdAt
        updatedAt
        log {
          from
          to
          action
          damage
          timestamp
        }
      }
      totalCount
    }
  }
`
