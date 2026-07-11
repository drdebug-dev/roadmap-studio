import type { StepDetail } from '../../types/step.ts'
import { apiClient } from './client.ts'

export const stepsApi = {
  getById: async (slug: string, id: number) => {
    const { data } = await apiClient.get<StepDetail>(
      `/roadmaps/${slug}/steps/${id}/`,
    )
    return data
  },
}
