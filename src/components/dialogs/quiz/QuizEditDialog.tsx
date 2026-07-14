import { useState } from 'react'

import { QuestionEditorList } from '@/components/dialogs/quiz/QuestionEditorList'
import { QuizMetadataForm } from '@/components/dialogs/quiz/QuizMetadataForm'
import {
  EMPTY_QUIZ_METADATA,
  type QuizMetadataFormState,
} from '@/components/dialogs/quiz/quiz-metadata-state'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  useCreateQuiz,
  useQuiz,
  useUpdateQuiz,
} from '@/hooks/useQuizzes'
import type { QuizDetail } from '@/types/quiz'

type QuizEditDialogProps = {
  slug: string
  stepId: number
  mode: 'create' | 'edit'
  quizId: number | null
  open: boolean
  onClose: () => void
}

function mapDetailToMetadata(quiz: QuizDetail): QuizMetadataFormState {
  return {
    title: quiz.title,
    description: quiz.description,
    difficulty: quiz.difficulty,
  }
}

type QuizEditDialogContentProps = {
  slug: string
  stepId: number
  mode: 'create' | 'edit'
  initialDetail: QuizDetail | null
  onClose: () => void
}

function QuizEditDialogContent({
  slug,
  stepId,
  mode,
  initialDetail,
  onClose,
}: QuizEditDialogContentProps) {
  const createQuiz = useCreateQuiz()
  const updateQuiz = useUpdateQuiz()

  const [activeQuizId, setActiveQuizId] = useState<number | null>(
    initialDetail?.id ?? null,
  )
  const [metadata, setMetadata] = useState<QuizMetadataFormState>(() =>
    initialDetail ? mapDetailToMetadata(initialDetail) : EMPTY_QUIZ_METADATA,
  )
  const [titleError, setTitleError] = useState<string | null>(null)

  const isEditing = activeQuizId !== null
  const { data: quizDetail, isLoading: isQuizLoading } = useQuiz(
    slug,
    activeQuizId ?? 0,
  )
  const resolvedQuizDetail = quizDetail ?? initialDetail
  const isSavingMetadata = createQuiz.isPending || updateQuiz.isPending

  const handleSaveMetadata = async () => {
    const trimmedTitle = metadata.title.trim()
    if (!trimmedTitle) {
      setTitleError('Title is required.')
      return
    }

    setTitleError(null)

    try {
      if (isEditing && activeQuizId) {
        await updateQuiz.mutateAsync({
          slug,
          id: activeQuizId,
          input: {
            title: trimmedTitle,
            description: metadata.description.trim(),
            difficulty: metadata.difficulty,
            step: stepId,
          },
        })
      } else {
        const created = await createQuiz.mutateAsync({
          slug,
          input: {
            title: trimmedTitle,
            description: metadata.description.trim(),
            difficulty: metadata.difficulty,
            step: stepId,
          },
        })
        setActiveQuizId(created.id)
      }
    } catch {
      // Global mutation toast handles API errors.
    }
  }

  const dialogTitle =
    mode === 'create' && !isEditing ? 'Create quiz' : 'Edit quiz'

  return (
    <>
      <DialogHeader>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogDescription>
          Manage quiz metadata and questions for this step.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <QuizMetadataForm
          value={metadata}
          onChange={(nextValue) => {
            setTitleError(null)
            setMetadata(nextValue)
          }}
          disabled={isSavingMetadata}
          titleError={titleError}
        />

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSaveMetadata}
            disabled={isSavingMetadata}
          >
            {isSavingMetadata
              ? 'Saving…'
              : isEditing
                ? 'Save quiz'
                : 'Create quiz'}
          </Button>
        </div>

        {isEditing && activeQuizId ? (
          <>
            <Separator />
            <QuestionEditorList
              slug={slug}
              quizId={activeQuizId}
              questions={resolvedQuizDetail?.questions ?? []}
              isLoading={isQuizLoading && !resolvedQuizDetail?.questions}
            />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Save the quiz first to add questions.
          </p>
        )}
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </>
  )
}

export function QuizEditDialog({
  slug,
  stepId,
  mode,
  quizId,
  open,
  onClose,
}: QuizEditDialogProps) {
  const { data: editDetail, isLoading: isEditLoading } = useQuiz(
    slug,
    mode === 'edit' && quizId ? quizId : 0,
  )

  const isWaitingForDetail =
    open && mode === 'edit' && Boolean(quizId) && isEditLoading && !editDetail

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        {isWaitingForDetail ? (
          <>
            <DialogHeader>
              <DialogTitle>Edit quiz</DialogTitle>
              <DialogDescription>Loading quiz details…</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-8">
              <div className="h-10 animate-pulse rounded-md bg-muted" />
              <div className="h-32 animate-pulse rounded-md bg-muted" />
            </div>
          </>
        ) : open ? (
          <QuizEditDialogContent
            key={`${mode}-${quizId ?? 'new'}-${editDetail?.updated_at ?? 'create'}`}
            slug={slug}
            stepId={stepId}
            mode={mode}
            initialDetail={mode === 'edit' ? (editDetail ?? null) : null}
            onClose={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
