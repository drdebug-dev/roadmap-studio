import { ChevronDown, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { ChoiceEditorList } from '@/components/dialogs/quiz/ChoiceEditorList'
import {
  QUESTION_TYPE_LABELS,
  QuestionTypeSelect,
} from '@/components/dialogs/quiz/QuestionTypeSelect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useCreateQuizQuestion,
  useDeleteQuizQuestion,
  useUpdateQuizQuestion,
} from '@/hooks/useQuizzes'
import {
  getDefaultChoicesForType,
  validateQuestion,
} from '@/lib/quiz-validation'
import type {
  CreateQuizChoiceInput,
  CreateQuizQuestionInput,
  QuestionType,
  QuizQuestion,
} from '@/types/quiz'

type QuestionEditorCardProps = {
  slug: string
  quizId: number
  question?: QuizQuestion
  draft?: {
    localId: string
    text: string
    question_type: QuestionType
    explanation: string
    choices: CreateQuizChoiceInput[]
  }
  index: number
  defaultExpanded?: boolean
  onDiscardDraft?: (localId: string) => void
  onSaved?: () => void
}

function mapQuestionToFormState(question: QuizQuestion) {
  return {
    text: question.text,
    question_type: question.question_type,
    explanation: question.explanation,
    choices: question.choices.map((choice) => ({
      text: choice.text,
      is_correct: choice.is_correct,
    })),
  }
}

export function QuestionEditorCard({
  slug,
  quizId,
  question,
  draft,
  index,
  defaultExpanded = false,
  onDiscardDraft,
  onSaved,
}: QuestionEditorCardProps) {
  const isDraft = Boolean(draft)
  const createQuestion = useCreateQuizQuestion()
  const updateQuestion = useUpdateQuizQuestion()
  const deleteQuestion = useDeleteQuizQuestion()

  const [expanded, setExpanded] = useState(defaultExpanded)
  const [text, setText] = useState(question?.text ?? draft?.text ?? '')
  const [questionType, setQuestionType] = useState<QuestionType>(
    question?.question_type ?? draft?.question_type ?? 'single_choice',
  )
  const [explanation, setExplanation] = useState(
    question?.explanation ?? draft?.explanation ?? '',
  )
  const [choices, setChoices] = useState<CreateQuizChoiceInput[]>(
    question
      ? mapQuestionToFormState(question).choices
      : (draft?.choices ?? getDefaultChoicesForType('single_choice')),
  )
  const [validationError, setValidationError] = useState<string | null>(null)

  const isSaving = createQuestion.isPending || updateQuestion.isPending
  const isDeleting = deleteQuestion.isPending

  const handleTypeChange = (nextType: QuestionType) => {
    setQuestionType(nextType)
    setChoices(getDefaultChoicesForType(nextType))
    setValidationError(null)
  }

  const handleSave = async () => {
    const error = validateQuestion(text, questionType, choices)
    if (error) {
      setValidationError(error)
      return
    }

    setValidationError(null)

    const input: CreateQuizQuestionInput = {
      text: text.trim(),
      question_type: questionType,
      explanation: explanation.trim(),
      choices,
    }

    try {
      if (isDraft) {
        await createQuestion.mutateAsync({ slug, quizId, input })
        onDiscardDraft?.(draft!.localId)
      } else if (question) {
        await updateQuestion.mutateAsync({
          slug,
          quizId,
          questionId: question.id,
          input,
        })
      }
      onSaved?.()
    } catch {
      // Global mutation toast handles API errors.
    }
  }

  const handleDelete = async () => {
    if (isDraft) {
      onDiscardDraft?.(draft!.localId)
      return
    }

    if (!question) {
      return
    }

    try {
      await deleteQuestion.mutateAsync({
        slug,
        quizId,
        questionId: question.id,
      })
      onSaved?.()
    } catch {
      // Global mutation toast handles API errors.
    }
  }

  const titlePreview = text.trim() || `Question ${index + 1}`

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        onClick={() => setExpanded((current) => !current)}
      >
        <div className="flex min-w-0 items-center gap-2">
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
          />
          <span className="truncate font-medium">{titlePreview}</span>
          <Badge variant="outline" className="shrink-0 text-[10px] font-normal">
            {QUESTION_TYPE_LABELS[questionType]}
          </Badge>
          {isDraft ? (
            <Badge variant="secondary" className="shrink-0 text-[10px] font-normal">
              Draft
            </Badge>
          ) : null}
        </div>
      </button>

      {expanded ? (
        <div className="border-t">
          <div className="max-h-[min(420px,50vh)] space-y-4 overflow-y-auto p-4">
            <div className="space-y-2">
              <Label htmlFor={`question-text-${question?.id ?? draft?.localId}`}>
                Question text
              </Label>
              <Input
                id={`question-text-${question?.id ?? draft?.localId}`}
                value={text}
                onChange={(event) => {
                  setValidationError(null)
                  setText(event.target.value)
                }}
                placeholder="Enter the question"
                disabled={isSaving || isDeleting}
              />
            </div>

            <QuestionTypeSelect
              value={questionType}
              onChange={handleTypeChange}
              disabled={isSaving || isDeleting}
            />

            <div className="space-y-2">
              <Label
                htmlFor={`question-explanation-${question?.id ?? draft?.localId}`}
              >
                Explanation
              </Label>
              <Input
                id={`question-explanation-${question?.id ?? draft?.localId}`}
                value={explanation}
                onChange={(event) => setExplanation(event.target.value)}
                placeholder="Explain the correct answer"
                disabled={isSaving || isDeleting}
              />
            </div>

            <ChoiceEditorList
              groupName={`correct-${question?.id ?? draft?.localId}`}
              questionType={questionType}
              choices={choices}
              onChange={(nextChoices) => {
                setValidationError(null)
                setChoices(nextChoices)
              }}
              disabled={isSaving || isDeleting}
            />

            {validationError ? (
              <p className="text-sm text-destructive">{validationError}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2 border-t bg-background p-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {isDraft ? 'Discard' : 'Delete'}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isDeleting}
            >
              {isSaving ? 'Saving…' : isDraft ? 'Save question' : 'Update question'}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
