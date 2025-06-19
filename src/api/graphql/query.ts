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
        id
        name
        level
        files {
          id
          url
          name
          contentType
          fileType
        }
        userId
        isSelected
      }
    }
  }
`

export const MONSTER = gql`
  query Monster($monsterId: String!) {
    Monster(id: $monsterId) {
      bodyMass
      createdAt
      files {
        contentType
        fileType
        id
        url
        version
      }
      id
      isSelected
      level
      name
      userId
      updatedAt
    }
  }
`

export const MONSTER_BATTLE = gql`
  query MonsterBattle($monsterBattleId: String!) {
    MonsterBattle(id: $monsterBattleId) {
      challengerMonsterId
      createdAt
      id
      log
      opponentMonsterId
      status
      updatedAt
      winnerMonsterId
    }
  }
`
