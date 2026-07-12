import { isAxiosError } from 'axios'
import { useState } from 'react'

import {
  DeleteConfirmDialog,
  getNamedDeleteDescription,
} from '@/components/dialogs/DeleteConfirmDialog'
import { ExerciseEditorList } from '@/components/dialogs/step-edit/ExerciseEditorList'
import { useStepEditContext } from '@/components/dialogs/step-edit/StepEditContext'
import { useDeleteExercise, useExercises } from '@/hooks/useExercises'
import type { Exercise } from '@/types/exercise'

function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong.'
}

export function ExercisesTab() {
  const { selectedSlug: slug, stepId } = useStepEditContext()
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data, isLoading, isError } = useExercises(slug ?? '', {
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
      await deleteExercise.mutateAsync({ slug: slug ?? '', id: deleteTarget.id })
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(getApiErrorMessage(error))
    }
  }

  const handleCancelDelete = () => {
    setDeleteTarget(null)
    setDeleteError(null)
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
        slug={slug ?? ''}
        stepId={stepId}
        exercises={exercises}
        onDeleteRequest={(exercise) => {
          setDeleteError(null)
          setDeleteTarget(exercise)
        }}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        title="Delete exercise"
        description={
          deleteTarget ? getNamedDeleteDescription(deleteTarget.title) : ''
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isPending={deleteExercise.isPending}
        error={deleteError}
      />
    </>
  )
}
