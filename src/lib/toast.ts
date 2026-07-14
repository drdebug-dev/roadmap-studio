import { isAxiosError } from 'axios'
import { toast as sonnerToast } from 'sonner'

export type ToastMutationMeta = {
  /** Disable automatic success/error toasts for this mutation */
  toast?: false
  success?: string | false
  error?: string | false
}

const ENTITY_LABELS: Record<string, string> = {
  roadmaps: 'Roadmap',
  'roadmap-steps': 'Roadmap',
  steps: 'Step',
  faqs: 'FAQ',
  quizzes: 'Quiz',
  'quiz-questions': 'Question',
  exercises: 'Exercise',
  categories: 'Category',
}

const ACTION_MESSAGES: Record<string, string> = {
  create: 'created successfully',
  update: 'saved successfully',
  delete: 'deleted successfully',
  deleteResource: 'deleted successfully',
  save: 'saved successfully',
}

export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data

    if (typeof data === 'string' && data.trim()) {
      return data
    }

    if (data && typeof data === 'object') {
      const detail = 'detail' in data ? data.detail : undefined
      if (typeof detail === 'string' && detail.trim()) {
        return detail
      }
      if (Array.isArray(detail) && detail.length > 0) {
        return detail.map((message) => String(message)).join(' ')
      }

      const messages = Object.entries(data).flatMap(([field, value]) => {
        if (Array.isArray(value)) {
          return value.map((message) => `${field}: ${String(message)}`)
        }
        return [`${field}: ${String(value)}`]
      })

      if (messages.length > 0) {
        return messages.join(' ')
      }
    }

    if (error.message) {
      return error.message
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

export function getMutationSuccessMessage(mutationKey: unknown): string {
  if (!Array.isArray(mutationKey) || mutationKey.length < 2) {
    return 'Operation completed successfully'
  }

  const [entity, action] = mutationKey
  const entityLabel = ENTITY_LABELS[String(entity)] ?? 'Item'
  const actionSuffix = ACTION_MESSAGES[String(action)]

  if (action === 'deleteResource') {
    return 'Resource deleted successfully'
  }

  if (actionSuffix) {
    return `${entityLabel} ${actionSuffix}`
  }

  return 'Operation completed successfully'
}

export function resolveMutationSuccessMessage(
  mutationKey: unknown,
  meta?: ToastMutationMeta,
): string | null {
  if (meta?.toast === false || meta?.success === false) {
    return null
  }

  if (typeof meta?.success === 'string') {
    return meta.success
  }

  return getMutationSuccessMessage(mutationKey)
}

export function resolveMutationErrorMessage(
  error: unknown,
  meta?: ToastMutationMeta,
): string | null {
  if (meta?.toast === false || meta?.error === false) {
    return null
  }

  if (typeof meta?.error === 'string') {
    return meta.error
  }

  return getApiErrorMessage(error)
}

export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  info: (message: string) => sonnerToast.info(message),
  warning: (message: string) => sonnerToast.warning(message),
  loading: (message: string) => sonnerToast.loading(message),
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
}
