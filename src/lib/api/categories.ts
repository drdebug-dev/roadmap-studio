import type { PaginatedResponse, ListParams } from '../../types/api.ts'
import type { Category, CreateCategoryInput } from '../../types/category.ts'
import { apiClient } from './client.ts'

export const categoriesApi = {
  list: async (params?: ListParams) => {
    const { data } = await apiClient.get<PaginatedResponse<Category>>(
      '/categories/',
      { params },
    )
    return data
  },

  create: async (input: CreateCategoryInput) => {
    const { data } = await apiClient.post<Category>('/categories/', input)
    return data
  },
}
