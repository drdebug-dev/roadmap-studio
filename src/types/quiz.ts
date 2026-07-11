export type QuizDifficulty = 'advanced' | 'easy' | 'medium'

export type QuestionType = 'multiple_choice' | 'single_choice' | 'true_false'

export type CreateQuizInput = {
  step?: number | null
  title: string
  description: string
  difficulty: QuizDifficulty
}

export type Quiz = {
  id: number
  step: number | null
  title: string
  description: string
  difficulty: QuizDifficulty
  order: number
  created_at: string
  updated_at: string
}

export type CreateQuizChoiceInput = {
  text: string
  is_correct: boolean
}

export type CreateQuizQuestionInput = {
  text: string
  question_type: QuestionType
  explanation: string
  choices: CreateQuizChoiceInput[]
}

export type QuizChoice = {
  id: number
  text: string
  is_correct: boolean
  order: number
}

export type QuizQuestion = {
  id: number
  text: string
  question_type: QuestionType
  explanation: string
  order: number
  choices: QuizChoice[]
  created_at: string
  updated_at: string
}
