export type ExerciseDifficulty = 'advanced' | 'easy' | 'medium'

export type Exercise = {
  id: number
  roadmap: number
  step: number
  title: string
  description: string
  difficulty: ExerciseDifficulty
  solution_url: string
  order: number
}

export type ExercisesListParams = {
  difficulty?: ExerciseDifficulty
  ordering?: string
  page?: number
  search?: string
  step?: number
}
