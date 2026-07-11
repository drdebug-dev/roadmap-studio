import { Plus } from 'lucide-react'
import { useState } from 'react'

import {
  createEmptyExerciseDraft,
  ExerciseEditorCard,
  type LocalExerciseDraft,
} from '@/components/dialogs/step-edit/ExerciseEditorCard'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { Exercise } from '@/types/exercise'

type ExerciseEditorListProps = {
  slug: string
  stepId: number
  exercises: Exercise[]
  onDeleteRequest: (exercise: Exercise) => void
}

export function ExerciseEditorList({
  slug,
  stepId,
  exercises,
  onDeleteRequest,
}: ExerciseEditorListProps) {
  const [drafts, setDrafts] = useState<LocalExerciseDraft[]>([])

  const addExercise = () => {
    setDrafts((current) => [...current, createEmptyExerciseDraft()])
  }

  const removeDraft = (localId: string) => {
    setDrafts((current) =>
      current.filter((draft) => draft.localId !== localId),
    )
  }

  const hasItems = exercises.length > 0 || drafts.length > 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Exercises</Label>
        <Button type="button" variant="outline" size="sm" onClick={addExercise}>
          <Plus className="h-4 w-4" />
          Add exercise
        </Button>
      </div>

      {!hasItems ? (
        <p className="text-sm text-muted-foreground">
          No exercises yet. Add one to attach practice work to this step.
        </p>
      ) : (
        <div className="max-h-[min(420px,50vh)] space-y-4 overflow-y-auto pr-1">
          {exercises.map((exercise, index) => (
            <ExerciseEditorCard
              key={exercise.id}
              slug={slug}
              stepId={stepId}
              index={index}
              exercise={exercise}
              onDeleteRequest={onDeleteRequest}
            />
          ))}
          {drafts.map((draft, index) => (
            <ExerciseEditorCard
              key={draft.localId}
              slug={slug}
              stepId={stepId}
              index={exercises.length + index}
              exercise={draft}
              onDraftRemove={removeDraft}
            />
          ))}
        </div>
      )}
    </div>
  )
}
