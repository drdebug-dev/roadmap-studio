import { Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDifficultyLabel } from '@/lib/quiz-validation'
import type { Quiz } from '@/types/quiz'

type QuizSummaryCardProps = {
  quiz: Quiz
  questionCount?: number
  onEdit: () => void
  onDelete: () => void
}

export function QuizSummaryCard({
  quiz,
  questionCount,
  onEdit,
  onDelete,
}: QuizSummaryCardProps) {
  const resolvedQuestionCount =
    questionCount ?? quiz.questions_count ?? undefined

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-medium text-foreground">{quiz.title}</h4>
            <Badge variant="outline" className="text-[10px] font-normal">
              {formatDifficultyLabel(quiz.difficulty)}
            </Badge>
            {resolvedQuestionCount !== undefined ? (
              <Badge variant="secondary" className="text-[10px] font-normal">
                {resolvedQuestionCount}{' '}
                {resolvedQuestionCount === 1 ? 'question' : 'questions'}
              </Badge>
            ) : null}
          </div>
          {quiz.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {quiz.description}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Edit quiz"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            title="Delete quiz"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
