import type { ExerciseDifficulty } from '@/types/exercise'

export type LocalExerciseDraft = {
  localId: string
  title: string
  description: string
  difficulty: ExerciseDifficulty
  solution_url: string
}

export function createEmptyExerciseDraft(): LocalExerciseDraft {
  return {
    localId: crypto.randomUUID(),
    title: '',
    description: '',
    difficulty: 'easy',
    solution_url: '',
  }
}
