import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { roadmapKeys } from '../lib/api/queryKeys.ts'
import { roadmapsApi } from '../lib/api/roadmaps.ts'
import type { ListParams } from '../types/api.ts'
import type { RoadmapWritePayload } from '../types/roadmap-api.ts'

export function useRoadmaps(params?: ListParams) {
  return useQuery({
    queryKey: roadmapKeys.list(params),
    queryFn: () => roadmapsApi.list(params),
  })
}

export function useCreateRoadmap() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['roadmaps', 'create'],
    mutationFn: (input: RoadmapWritePayload) => roadmapsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.all })
    },
  })
}

export function useUpdateRoadmap() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['roadmaps', 'update'],
    mutationFn: ({
      slug,
      input,
    }: {
      slug: string
      input: RoadmapWritePayload
    }) => roadmapsApi.update(slug, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.all })
      queryClient.invalidateQueries({
        queryKey: roadmapKeys.detail(variables.slug),
      })
      if (variables.input.slug !== variables.slug) {
        queryClient.invalidateQueries({
          queryKey: roadmapKeys.detail(variables.input.slug),
        })
      }
    },
  })
}

export function useRoadmap(slug: string) {
  return useQuery({
    queryKey: roadmapKeys.detail(slug),
    queryFn: () => roadmapsApi.getBySlug(slug),
    enabled: Boolean(slug),
  })
}
