import { useQuery } from '@tanstack/react-query'
import { stepKeys } from '../lib/api/queryKeys.ts'
import { stepsApi } from '../lib/api/steps.ts'

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
