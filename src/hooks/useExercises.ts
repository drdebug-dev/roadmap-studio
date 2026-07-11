import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { exerciseKeys } from '../lib/api/queryKeys.ts'
import { exercisesApi } from '../lib/api/exercises.ts'
import type {
  CreateExerciseInput,
  ExercisesListParams,
  UpdateExerciseInput,
} from '../types/exercise.ts'

export function useExercises(slug: string, params?: ExercisesListParams) {
  return useQuery({
    queryKey: exerciseKeys.list(slug, params),
    queryFn: () => exercisesApi.list(slug, params),
    enabled: Boolean(slug) && (params?.step === undefined || params.step > 0),
  })
}

export function useCreateExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      slug,
      input,
    }: {
      slug: string
      input: CreateExerciseInput
    }) => exercisesApi.create(slug, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.all })
      queryClient.invalidateQueries({
        queryKey: exerciseKeys.list(variables.slug),
      })
    },
  })
}

export function useUpdateExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      slug,
      id,
      input,
    }: {
      slug: string
      id: number
      input: UpdateExerciseInput
    }) => exercisesApi.update(slug, id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: exerciseKeys.list(variables.slug),
      })
    },
  })
}

export function useDeleteExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slug, id }: { slug: string; id: number }) =>
      exercisesApi.delete(slug, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: exerciseKeys.list(variables.slug),
      })
    },
  })
}
