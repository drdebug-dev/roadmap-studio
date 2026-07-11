import type { PaginatedResponse } from '../../types/api.ts'
import type {
  CreateFaqInput,
  Faq,
  FaqDetail,
  FaqsListParams,
  UpdateFaqInput,
} from '../../types/faq.ts'
import { apiClient } from './client.ts'

export const faqsApi = {
  list: async (slug: string, params?: FaqsListParams) => {
    const { data } = await apiClient.get<PaginatedResponse<Faq>>(
      `/roadmaps/${slug}/faqs/`,
      { params },
    )
    return data
  },

  create: async (slug: string, input: CreateFaqInput) => {
    const { data } = await apiClient.post<FaqDetail>(
      `/roadmaps/${slug}/faqs/`,
      input,
    )
    return data
  },

  update: async (slug: string, id: number, input: UpdateFaqInput) => {
    const { data } = await apiClient.patch<FaqDetail>(
      `/roadmaps/${slug}/faqs/${id}/`,
      input,
    )
    return data
  },

  delete: async (slug: string, id: number) => {
    await apiClient.delete(`/roadmaps/${slug}/faqs/${id}/`)
  },
}
