import { isAxiosError } from 'axios'
import { Plus } from 'lucide-react'
import { useState } from 'react'

import { QuizEditDialog } from '@/components/dialogs/quiz/QuizEditDialog'
import { QuizSummaryCard } from '@/components/dialogs/step-edit/QuizSummaryCard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDeleteQuiz, useQuizzes } from '@/hooks/useQuizzes'
import type { Quiz } from '@/types/quiz'

type QuizzesTabProps = {
  slug: string
  stepId: number | null
}

type QuizEditorState =
  | { mode: 'create' }
  | { mode: 'edit'; quizId: number }

function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong.'
}

export function QuizzesTab({ slug, stepId }: QuizzesTabProps) {
  const [editorState, setEditorState] = useState<QuizEditorState | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Quiz | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuizzes(slug, {
    step: stepId ?? undefined,
  })
  const deleteQuiz = useDeleteQuiz()

  if (!stepId) {
    return (
      <p className="text-sm text-muted-foreground">
        Save the step to the server before adding quizzes.
      </p>
    )
  }

  const quizzes = data?.results ?? []

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setDeleteError(null)

    try {
      await deleteQuiz.mutateAsync({ slug, id: deleteTarget.id })
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(getApiErrorMessage(error))
    }
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Quizzes</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditorState({ mode: 'create' })}
          >
            <Plus className="h-4 w-4" />
            Add quiz
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <div className="h-20 animate-pulse rounded-lg bg-muted" />
            <div className="h-20 animate-pulse rounded-lg bg-muted" />
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">
            Failed to load quizzes. Please try again.
          </p>
        ) : quizzes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No quizzes yet. Add one to attach assessment content to this step.
          </p>
        ) : (
          <ScrollArea className="max-h-[420px] pr-3">
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <QuizSummaryCard
                  key={quiz.id}
                  quiz={quiz}
                  onEdit={() =>
                    setEditorState({ mode: 'edit', quizId: quiz.id })
                  }
                  onDelete={() => {
                    setDeleteError(null)
                    setDeleteTarget(quiz)
                  }}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <QuizEditDialog
        slug={slug}
        stepId={stepId}
        mode={editorState?.mode ?? 'create'}
        quizId={editorState?.mode === 'edit' ? editorState.quizId : null}
        open={editorState !== null}
        onClose={() => setEditorState(null)}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setDeleteError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;?
              All questions in this quiz will also be removed. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError ? (
            <p className="text-sm text-destructive">{deleteError}</p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteTarget(null)
                setDeleteError(null)
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteQuiz.isPending}
            >
              {deleteQuiz.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
