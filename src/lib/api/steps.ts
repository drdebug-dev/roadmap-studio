import type {
  BulkUpdateStepsInput,
  CreateResourceInput,
  CreateStepInput,
  StepDetail,
  StepResource,
  UpdateStepInput,
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

  update: async (slug: string, id: number, input: UpdateStepInput) => {
    const { data } = await apiClient.patch<StepDetail>(
      `/roadmaps/${slug}/steps/${id}/`,
      input,
    )
    return data
  },

  bulkUpdate: async (slug: string, input: BulkUpdateStepsInput) => {
    const { data } = await apiClient.patch<StepDetail[]>(
      `/roadmaps/${slug}/steps/bulk/`,
      input,
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

  delete: async (slug: string, id: number) => {
    await apiClient.delete(`/roadmaps/${slug}/steps/${id}/`)
  },

  deleteResource: async (slug: string, stepId: number, resourceId: number) => {
    await apiClient.delete(
      `/roadmaps/${slug}/steps/${stepId}/resources/${resourceId}/`,
    )
  },
}
