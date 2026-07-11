import type { PaginatedResponse } from '../../types/api.ts'
import type {
  CreateExerciseInput,
  Exercise,
  ExercisesListParams,
  UpdateExerciseInput,
} from '../../types/exercise.ts'
import { apiClient } from './client.ts'

export const exercisesApi = {
  list: async (slug: string, params?: ExercisesListParams) => {
    const { data } = await apiClient.get<PaginatedResponse<Exercise>>(
      `/roadmaps/${slug}/exercises/`,
      { params },
    )
    return data
  },

  create: async (slug: string, input: CreateExerciseInput) => {
    const { data } = await apiClient.post<Exercise>(
      `/roadmaps/${slug}/exercises/`,
      input,
    )
    return data
  },

  update: async (slug: string, id: number, input: UpdateExerciseInput) => {
    const { data } = await apiClient.patch<Exercise>(
      `/roadmaps/${slug}/exercises/${id}/`,
      input,
    )
    return data
  },

  delete: async (slug: string, id: number) => {
    await apiClient.delete(`/roadmaps/${slug}/exercises/${id}/`)
  },
}
