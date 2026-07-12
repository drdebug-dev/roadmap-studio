import type {
  CreateResourceInput,
  CreateStepInput,
  StepDetail,
  StepResource,
} from '../../types/step.ts'
import { apiClient } from './client.ts'

export const stepsApi = {
  getById: async (slug: string, id: number) => {
    const { data } = await apiClient.get<StepDetail>(
      `/roadmaps/${slug}/steps/${id}/`,
    )
    return data
  },

  create: async (slug: string, input: CreateStepInput) => {
    const { data } = await apiClient.post<StepDetail>(
      `/roadmaps/${slug}/steps/`,
      {
        ...input,
        parent: input.parent ?? null,
      },
    )
    return data
  },

  createResource: async (
    slug: string,
    stepId: number,
    input: CreateResourceInput,
  ) => {
    const { data } = await apiClient.post<StepResource>(
      `/roadmaps/${slug}/steps/${stepId}/resources/`,
      input,
    )
    return data
  },
}
