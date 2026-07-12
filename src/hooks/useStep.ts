import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { roadmapKeys, stepKeys } from '../lib/api/queryKeys.ts'
import { stepsApi } from '../lib/api/steps.ts'
import type { CreateStepInput, UpdateStepInput } from '../types/step.ts'

type UseStepOptions = {
  enabled?: boolean
}

export function useStep(slug: string, id: number, options: UseStepOptions = {}) {
  return useQuery({
    queryKey: stepKeys.detail(slug, id),
    queryFn: () => stepsApi.getById(slug, id),
    enabled: options.enabled ?? Boolean(slug && id),
  })
}

export function useCreateStep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      slug,
      input,
    }: {
      slug: string
      input: CreateStepInput
    }) => stepsApi.create(slug, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: roadmapKeys.detail(variables.slug),
      })
    },
  })
}

export function useUpdateStep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      slug,
      id,
      input,
    }: {
      slug: string
      id: number
      input: UpdateStepInput
    }) => stepsApi.update(slug, id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: stepKeys.detail(variables.slug, variables.id),
      })
      queryClient.invalidateQueries({
        queryKey: roadmapKeys.detail(variables.slug),
      })
    },
  })
}

export function useDeleteStep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slug, id }: { slug: string; id: number }) =>
      stepsApi.delete(slug, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: stepKeys.detail(variables.slug, variables.id),
      })
      queryClient.invalidateQueries({
        queryKey: roadmapKeys.detail(variables.slug),
      })
    },
  })
}

export function useDeleteResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      slug,
      stepId,
      resourceId,
    }: {
      slug: string
      stepId: number
      resourceId: number
    }) => stepsApi.deleteResource(slug, stepId, resourceId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: stepKeys.detail(variables.slug, variables.stepId),
      })
      queryClient.invalidateQueries({
        queryKey: roadmapKeys.detail(variables.slug),
      })
    },
  })
}
