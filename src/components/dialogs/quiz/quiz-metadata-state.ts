import type { QuizDifficulty } from '@/types/quiz'

export type QuizMetadataFormState = {
  title: string
  description: string
  difficulty: QuizDifficulty
}

export const EMPTY_QUIZ_METADATA: QuizMetadataFormState = {
  title: '',
  description: '',
  difficulty: 'easy',
}
