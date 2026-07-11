import { getDefaultChoicesForType } from '@/lib/quiz-validation'
import type { CreateQuizChoiceInput, QuestionType } from '@/types/quiz'

export type LocalQuestionDraft = {
  localId: string
  text: string
  question_type: QuestionType
  explanation: string
  choices: CreateQuizChoiceInput[]
}

export function createQuestionDraft(): LocalQuestionDraft {
  return {
    localId: crypto.randomUUID(),
    text: '',
    question_type: 'single_choice',
    explanation: '',
    choices: getDefaultChoicesForType('single_choice'),
  }
}
