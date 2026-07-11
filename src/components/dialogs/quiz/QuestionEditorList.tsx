import { Plus } from 'lucide-react'
import { useState } from 'react'

import {
  createQuestionDraft,
  type LocalQuestionDraft,
} from '@/components/dialogs/quiz/question-draft'
import { QuestionEditorCard } from '@/components/dialogs/quiz/QuestionEditorCard'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { QuizQuestion } from '@/types/quiz'

type QuestionEditorListProps = {
  slug: string
  quizId: number
  questions: QuizQuestion[]
  isLoading?: boolean
}

export function QuestionEditorList({
  slug,
  quizId,
  questions,
  isLoading = false,
}: QuestionEditorListProps) {
  const [drafts, setDrafts] = useState<LocalQuestionDraft[]>([])

  const addDraft = () => {
    setDrafts((current) => [...current, createQuestionDraft()])
  }

  const discardDraft = (localId: string) => {
    setDrafts((current) =>
      current.filter((draft) => draft.localId !== localId),
    )
  }

  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order)
  const totalCount = sortedQuestions.length + drafts.length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Questions ({totalCount})</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addDraft}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          Add question
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
        </div>
      ) : totalCount === 0 ? (
        <p className="text-sm text-muted-foreground">
          No questions yet. Add one to build this quiz.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedQuestions.map((question, index) => (
            <QuestionEditorCard
              key={`${question.id}-${question.updated_at}`}
              slug={slug}
              quizId={quizId}
              question={question}
              index={index}
            />
          ))}
          {drafts.map((draft, index) => (
            <QuestionEditorCard
              key={draft.localId}
              slug={slug}
              quizId={quizId}
              draft={draft}
              index={sortedQuestions.length + index}
              defaultExpanded
              onDiscardDraft={discardDraft}
            />
          ))}
        </div>
      )}
    </div>
  )
}
