import { gql } from '@apollo/client'

export const USER_LOGIN = gql`
	mutation Login($initData: String!, $telegramId: String!) {
		UserLogin(initData: $initData, telegramId: $telegramId) {
			id
			token
			nameProfessor
			isRegistered
			avatar {
				id
				url
			}
		}
	}
`

export const USER_UPDATE = gql`
	mutation UpdateUser($id: String!, $nameProfessor: String!, $isRegistered: Boolean!, $avatarFileId: String) {
		UserUpdate(id: $id, nameProfessor: $nameProfessor, isRegistered: $isRegistered, avatarFileId: $avatarFileId) {
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
			bodyMass
			updatedAt
			userId
			files {
				id
				url
			}
		}
	}
`
