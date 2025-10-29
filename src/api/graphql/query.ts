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
      items {
        defense
        evasion
        experiencePoints
        files {
          url
          version
          id
          fileType
          contentType
        }
        healthPoints
        id
        isSelected
        lastFedAt
        level
        monsterAttacks {
          id
          monsterId
          skill {
            cooldown
            defense
            description
            effects
            energyCost
            evasion
            iconFile {
              url
            }
            iconFileId
            id
            isBase
            name
            rarity
            strength
          }
          skillId
        }
        monsterDefenses {
          id
          monsterId
          skill {
            cooldown
            defense
            description
            effects
            energyCost
            evasion
            iconFile {
              url
            }
            iconFileId
            id
            isBase
            name
            rarity
            strength
          }
          skillId
        }
        name
        nextLevelExp
        satiety
        stamina
        strength
        userId
      }
      totalCount
    }
  }
`

export const MONSTER = gql`
  query Monster($monsterId: String!) {
    Monster(id: $monsterId) {
      defense
      evasion
      experiencePoints
      files {
        url
        version
        id
        fileType
        contentType
      }
      healthPoints
      id
      isSelected
      lastFedAt
      level
      monsterAttacks {
        id
        monsterId
        skill {
          cooldown
          defense
          description
          effects
          energyCost
          evasion
          iconFile {
            url
          }
          iconFileId
          id
          isBase
          name
          rarity
          strength
        }
        skillId
      }
      monsterDefenses {
        id
        monsterId
        skill {
          cooldown
          defense
          description
          effects
          energyCost
          evasion
          iconFile {
            url
          }
          iconFileId
          id
          isBase
          name
          rarity
          strength
        }
        skillId
      }
      name
      nextLevelExp
      satiety
      stamina
      strength
      userId
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

export const USER = gql`
  query User($id: String!) {
    User(id: $id) {
      telegramId
      nameProfessor
      name
      isRegistered
      id
      energy
      avatarFileId
      avatar {
        url
      }
    }
  }
`

export const USER_INVENTORY = gql`
  query UserInventories(
    $limit: Float!
    $offset: Float!
    $name: StringFilter
    $type: UserInventoryTypeFilter
  ) {
    UserInventories(limit: $limit, offset: $offset, name: $name, type: $type) {
      totalCount
      items {
        food {
          description
          iconFileId
          id
          name
          satietyBonus
        }
        mutagen {
          description
          effectDescription
          iconFileId
          id
          name
          strength
          defense
          evasion
          iconFile {
            url
          }
        }
        skillId
        skill {
          cooldown
          defense
          description
          effects
          energyCost
          evasion
          iconFile {
            url
          }
          iconFileId
          id
          isBase
          name
          rarity
          strength
          type
        }
        energy {
          id
          isActive
          name
          priceMinor
          quantity
        }
        quantity
        mutagenId
        userInventoryType
        id
        foodId
      }
    }
  }
`

export const SKILL = gql`
  query Skill($skillId: String!) {
    Skill(id: $skillId) {
      cooldown
      defense
      description
      effects
      energyCost
      evasion
      iconFile {
        url
        id
        fileType
        contentType
      }
      iconFileId
      id
      name
      rarity
      strength
      type
      updatedAt
    }
  }
`
export const GET_FOOD_TODAY = gql`
  query GetFoodToday($userId: String!) {
    GetFoodToday(userId: $userId) {
      message
      quantity
      food {
        createdAt
        description
        iconFile {
          url
        }
        iconFileId
        id
        name
        satietyBonus
        updatedAt
      }
    }
  }
`
