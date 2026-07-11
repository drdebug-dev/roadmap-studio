import type {
  CreateQuizChoiceInput,
  QuestionType,
  QuizDifficulty,
} from '@/types/quiz'

export function getDefaultChoicesForType(
  questionType: QuestionType,
): CreateQuizChoiceInput[] {
  if (questionType === 'true_false') {
    return [
      { text: 'True', is_correct: true },
      { text: 'False', is_correct: false },
    ]
  }

  return [
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ]
}

export function validateQuestion(
  text: string,
  questionType: QuestionType,
  choices: CreateQuizChoiceInput[],
): string | null {
  if (!text.trim()) {
    return 'Question text is required.'
  }

  const nonEmptyChoices = choices.filter((choice) => choice.text.trim())
  const correctCount = choices.filter((choice) => choice.is_correct).length

  if (choices.some((choice) => !choice.text.trim())) {
    return 'Each choice must have text.'
  }

  if (questionType === 'true_false') {
    if (choices.length !== 2) {
      return 'True/false questions must have exactly 2 choices.'
    }
    if (correctCount !== 1) {
      return 'True/false questions must have exactly 1 correct choice.'
    }
    return null
  }

  if (nonEmptyChoices.length < 2) {
    return 'At least 2 choices are required.'
  }

  if (questionType === 'single_choice' && correctCount !== 1) {
    return 'Single choice questions must have exactly 1 correct choice.'
  }

  if (questionType === 'multiple_choice' && correctCount < 1) {
    return 'Multiple choice questions must have at least 1 correct choice.'
  }

  return null
}

export function formatDifficultyLabel(difficulty: QuizDifficulty): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}
