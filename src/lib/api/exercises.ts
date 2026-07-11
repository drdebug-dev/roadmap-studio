import type { PaginatedResponse } from '../../types/api.ts'
import type { Exercise, ExercisesListParams } from '../../types/exercise.ts'
import { apiClient } from './client.ts'

export const exercisesApi = {
  list: async (slug: string, params?: ExercisesListParams) => {
    const { data } = await apiClient.get<PaginatedResponse<Exercise>>(
      `/roadmaps/${slug}/exercises/`,
      { params },
    )
    return data
  },
}
