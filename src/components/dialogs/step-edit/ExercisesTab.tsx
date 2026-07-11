import { isAxiosError } from 'axios'
import { useState } from 'react'

import { ExerciseEditorList } from '@/components/dialogs/step-edit/ExerciseEditorList'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDeleteExercise, useExercises } from '@/hooks/useExercises'
import type { Exercise } from '@/types/exercise'

type ExercisesTabProps = {
  slug: string
  stepId: number | null
}

function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong.'
}

export function ExercisesTab({ slug, stepId }: ExercisesTabProps) {
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data, isLoading, isError } = useExercises(slug, {
    step: stepId ?? undefined,
  })
  const deleteExercise = useDeleteExercise()

  if (!stepId) {
    return (
      <p className="text-sm text-muted-foreground">
        Save the step to the server before adding exercises.
      </p>
    )
  }

  const exercises = data?.results ?? []

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setDeleteError(null)

    try {
      await deleteExercise.mutateAsync({ slug, id: deleteTarget.id })
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(getApiErrorMessage(error))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3 py-4">
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Failed to load exercises. Please try again.
      </p>
    )
  }

  return (
    <>
      <ExerciseEditorList
        slug={slug}
        stepId={stepId}
        exercises={exercises}
        onDeleteRequest={(exercise) => {
          setDeleteError(null)
          setDeleteTarget(exercise)
        }}
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
            <DialogTitle>Delete exercise</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;?
              This action cannot be undone.
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
              disabled={deleteExercise.isPending}
            >
              {deleteExercise.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
