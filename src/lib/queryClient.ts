import { MutationCache, QueryClient } from '@tanstack/react-query'

import {
  resolveMutationErrorMessage,
  resolveMutationSuccessMessage,
  toast,
} from '@/lib/toast'
import '@/types/react-query'

function handleRoadmapStepsSuccess(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return 'Roadmap saved successfully'
  }

  const result = data as {
    createdStepCount?: number
    updatedStepCount?: number
    createdConnectionCount?: number
  }

  const hasChanges =
    (result.createdStepCount ?? 0) > 0 ||
    (result.updatedStepCount ?? 0) > 0 ||
    (result.createdConnectionCount ?? 0) > 0

  if (!hasChanges) {
    return 'No changes to save'
  }

  return 'Roadmap saved successfully'
}

const mutationCache = new MutationCache({
  onSuccess: (data, _variables, _context, mutation) => {
    const meta = mutation.meta
    let message = resolveMutationSuccessMessage(mutation.options.mutationKey, meta)

    if (
      mutation.options.mutationKey?.[0] === 'roadmap-steps' &&
      meta?.success !== false
    ) {
      message = handleRoadmapStepsSuccess(data)
    }

    if (message) {
      const isInfo = message === 'No changes to save'
      if (isInfo) {
        toast.info(message)
      } else {
        toast.success(message)
      }
    }
  },
  onError: (error, _variables, _context, mutation) => {
    const message = resolveMutationErrorMessage(
      error,
      mutation.meta,
    )

    if (message) {
      toast.error(message)
    }
  },
})

export const queryClient = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
})
