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
