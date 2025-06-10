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
  fileType: string
  contentType: string
  createdAt: string
}
