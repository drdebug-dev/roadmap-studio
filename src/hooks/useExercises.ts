import { useQuery } from '@tanstack/react-query'
import { exercisesApi } from '../lib/api/exercises.ts'
import { exerciseKeys } from '../lib/api/queryKeys.ts'
import type { ExercisesListParams } from '../types/exercise.ts'

export function useExercises(slug: string, params?: ExercisesListParams) {
  return useQuery({
    queryKey: exerciseKeys.list(slug, params),
    queryFn: () => exercisesApi.list(slug, params),
    enabled: Boolean(slug),
  })
}
