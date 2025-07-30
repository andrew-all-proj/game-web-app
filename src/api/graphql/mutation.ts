import { gql } from '@apollo/client'

export const USER_LOGIN = gql`
  mutation Login($initData: String!, $telegramId: String!) {
    UserLogin(initData: $initData, telegramId: $telegramId) {
      id
      token
      nameProfessor
      isRegistered
      energy
      avatar {
        id
        url
      }
    }
  }
`

export const USER_UPDATE = gql`
  mutation UpdateUser(
    $id: String!
    $nameProfessor: String!
    $isRegistered: Boolean!
    $avatarFileId: String
  ) {
    UserUpdate(
      id: $id
      nameProfessor: $nameProfessor
      isRegistered: $isRegistered
      avatarFileId: $avatarFileId
    ) {
      id
      name
      nameProfessor
      isRegistered
      avatarFileId
      avatar {
        id
        url
      }
    }
  }
`

export const MONSTER_CREATE = gql`
  mutation MonsterCreate($name: String!, $fileId: String!, $selectedPartsKey: SelectedPartsKey!) {
    MonsterCreate(name: $name, fileId: $fileId, selectedPartsKey: $selectedPartsKey) {
      id
      name
      level
      updatedAt
      userId
      files {
        id
        url
      }
    }
  }
`

export const MONSTER_UPDATE = gql`
  mutation MonsterUpdate($id: String!, $name: String, $isSelected: Boolean!) {
    MonsterUpdate(id: $id, name: $name, isSelected: $isSelected) {
      id
      name
      level
      updatedAt
      userId
      isSelected
      files {
        id
        url
      }
    }
  }
`

export const MONSTER_FEED = gql`
  mutation MonsterFeed($monsterId: String!, $quantity: Float, $userInventoryId: String!) {
    MonsterFeed(monsterId: $monsterId, quantity: $quantity, userInventoryId: $userInventoryId) {
      error {
        error
        message
      }
      success
    }
  }
`

export const MONSTER_APPLY_MUTAGEN = gql`
  mutation MonsterApplyMutagen($monsterId: String!, $userInventoryId: String!) {
    MonsterApplyMutagen(monsterId: $monsterId, userInventoryId: $userInventoryId) {
      error {
        error
        message
      }
      success
    }
  }
`
