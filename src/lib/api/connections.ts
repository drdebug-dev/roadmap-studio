import type { RoadmapConnection } from '@/types/roadmap-api'
import { apiClient } from './client.ts'

export type CreateConnectionInput = {
  from_step: number
  to_step: number
}

export const connectionsApi = {
  create: async (slug: string, input: CreateConnectionInput) => {
    const { data } = await apiClient.post<RoadmapConnection>(
      `/roadmaps/${slug}/connections/`,
      input,
    )
    return data
  },
}
