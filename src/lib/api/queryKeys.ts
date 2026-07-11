import type { ListParams } from '../../types/api.ts'
import type { ExercisesListParams } from '../../types/exercise.ts'
import type { FaqsListParams } from '../../types/faq.ts'

export const categoryKeys = {
  all: ['categories'] as const,
  list: (params?: ListParams) => ['categories', 'list', params] as const,
}

export const roadmapKeys = {
  all: ['roadmaps'] as const,
  list: (params?: ListParams) => ['roadmaps', 'list', params] as const,
  detail: (slug: string) => ['roadmaps', 'detail', slug] as const,
}

export const exerciseKeys = {
  all: ['exercises'] as const,
  list: (slug: string, params?: ExercisesListParams) =>
    ['exercises', 'list', slug, params] as const,
}

export const faqKeys = {
  all: ['faqs'] as const,
  list: (slug: string, params?: FaqsListParams) =>
    ['faqs', 'list', slug, params] as const,
}

export const stepKeys = {
  all: ['steps'] as const,
  detail: (slug: string, id: number) => ['steps', 'detail', slug, id] as const,
}

export const quizKeys = {
  all: ['quizzes'] as const,
  list: (slug: string) => ['quizzes', 'list', slug] as const,
  detail: (slug: string, id: number) => ['quizzes', 'detail', slug, id] as const,
}
