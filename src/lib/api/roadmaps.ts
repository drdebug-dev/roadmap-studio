import type { PaginatedResponse, ListParams } from '../../types/api.ts'
import type {
  RoadmapDetail,
  RoadmapListItem,
  RoadmapWritePayload,
} from '../../types/roadmap-api.ts'
import { apiClient } from './client.ts'

function buildRoadmapFormData(input: RoadmapWritePayload): FormData {
  const formData = new FormData()
  formData.append('title', input.title)
  formData.append('slug', input.slug)
  formData.append('description', input.description)
  formData.append('status', input.status)
  formData.append('category', String(input.category))

  for (const relatedId of input.related_roadmaps) {
    formData.append('related_roadmaps', String(relatedId))
  }

  if (input.icon) {
    formData.append('icon', input.icon)
  } else if (input.clear_icon) {
    formData.append('icon', '')
  }

  if (input.cover_image) {
    formData.append('cover_image', input.cover_image)
  } else if (input.clear_cover_image) {
    formData.append('cover_image', '')
  }

  return formData
}

function normalizeListResponse(
  data: PaginatedResponse<RoadmapListItem> | RoadmapListItem[] | undefined,
): PaginatedResponse<RoadmapListItem> {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    }
  }

  return {
    count: data?.count ?? data?.results?.length ?? 0,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
    results: data?.results ?? [],
  }
}

export const roadmapsApi = {
  list: async (params?: ListParams) => {
    const { data } = await apiClient.get<
      PaginatedResponse<RoadmapListItem> | RoadmapListItem[]
    >('/roadmaps/', { params })
    return normalizeListResponse(data)
  },

  create: async (input: RoadmapWritePayload) => {
    const { data } = await apiClient.post<RoadmapDetail>(
      '/roadmaps/',
      buildRoadmapFormData(input),
    )
    return data
  },

  getBySlug: async (slug: string) => {
    const { data } = await apiClient.get<RoadmapDetail>(`/roadmaps/${slug}/`)
    return data
  },

  update: async (slug: string, input: RoadmapWritePayload) => {
    const { data } = await apiClient.patch<RoadmapDetail>(
      `/roadmaps/${slug}/`,
      buildRoadmapFormData(input),
    )
    return data
  },
}
