import { gql } from '@apollo/client'

export const FILES = gql`
	query Files($limit: Float!, $offset: Float!, $contentType: ContentTypeEnum) {
		Files(limit: $limit, offset: $offset, contentType: { eq: $contentType }) {
			totalCount
			items {
				id
				name
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
			}
		}
	}
`
