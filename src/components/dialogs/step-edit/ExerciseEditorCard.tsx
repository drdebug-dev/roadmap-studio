import { isAxiosError } from 'axios'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

import { isValidUrl } from '@/components/dialogs/step-edit/utils'
import { DifficultySelect } from '@/components/shared/DifficultySelect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useCreateExercise,
  useUpdateExercise,
} from '@/hooks/useExercises'
import type { Exercise, ExerciseDifficulty } from '@/types/exercise'

export type LocalExerciseDraft = {
  localId: string
  title: string
  description: string
  difficulty: ExerciseDifficulty
  solution_url: string
}

type ExerciseEditorCardProps = {
  slug: string
  stepId: number
  index: number
  exercise: Exercise | LocalExerciseDraft
  onDraftRemove?: (localId: string) => void
  onDeleteRequest?: (exercise: Exercise) => void
}

function isPersistedExercise(
  exercise: Exercise | LocalExerciseDraft,
): exercise is Exercise {
  return 'id' in exercise
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

function validateExerciseForm(
  title: string,
  solutionUrl: string,
): { titleError: string | null; urlError: string | null } {
  const titleError = title.trim() ? null : 'Title is required.'
  const trimmedUrl = solutionUrl.trim()
  const urlError =
    trimmedUrl && isValidUrl(trimmedUrl)
      ? null
      : 'Solution URL must be a valid URL.'

  return { titleError, urlError }
}

export function ExerciseEditorCard({
  slug,
  stepId,
  index,
  exercise,
  onDraftRemove,
  onDeleteRequest,
}: ExerciseEditorCardProps) {
  const [title, setTitle] = useState(exercise.title)
  const [description, setDescription] = useState(exercise.description)
  const [difficulty, setDifficulty] = useState(exercise.difficulty)
  const [solutionUrl, setSolutionUrl] = useState(exercise.solution_url)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const createExercise = useCreateExercise()
  const updateExercise = useUpdateExercise()

  const isPersisted = isPersistedExercise(exercise)
  const isSaving = createExercise.isPending || updateExercise.isPending
  const cardId = isPersisted ? String(exercise.id) : exercise.localId

  const handleSave = async () => {
    const validation = validateExerciseForm(title, solutionUrl)
    setTitleError(validation.titleError)
    setUrlError(validation.urlError)
    setSaveError(null)

    if (validation.titleError || validation.urlError) {
      return
    }

    const input = {
      step: stepId,
      title: title.trim(),
      description: description.trim(),
      difficulty,
      solution_url: solutionUrl.trim(),
    }

    try {
      if (isPersisted) {
        await updateExercise.mutateAsync({
          slug,
          id: exercise.id,
          input,
        })
      } else {
        await createExercise.mutateAsync({ slug, input })
        onDraftRemove?.(exercise.localId)
      }
    } catch (error) {
      setSaveError(getApiErrorMessage(error))
    }
  }

  const handleDelete = () => {
    if (isPersisted) {
      onDeleteRequest?.(exercise)
      return
    }

    onDraftRemove?.(exercise.localId)
  }

  return (
    <div className="rounded-lg border">
      <div className="border-b px-4 py-3">
        <span className="text-sm font-medium">Exercise {index + 1}</span>
      </div>

      <div className="max-h-[min(420px,50vh)] space-y-4 overflow-y-auto p-4">
        <div className="space-y-2">
          <Label htmlFor={`exercise-title-${cardId}`}>Title</Label>
          <Input
            id={`exercise-title-${cardId}`}
            value={title}
            onChange={(event) => {
              setTitleError(null)
              setTitle(event.target.value)
            }}
            placeholder="Exercise title"
            aria-invalid={Boolean(titleError)}
          />
          {titleError ? (
            <p className="text-sm text-destructive">{titleError}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`exercise-description-${cardId}`}>Description</Label>
          <Input
            id={`exercise-description-${cardId}`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the exercise"
          />
        </div>

        <DifficultySelect
          id={`exercise-difficulty-${cardId}`}
          value={difficulty}
          onChange={(value) => setDifficulty(value as ExerciseDifficulty)}
        />

        <div className="space-y-2">
          <Label htmlFor={`exercise-solution-url-${cardId}`}>Solution URL</Label>
          <Input
            id={`exercise-solution-url-${cardId}`}
            value={solutionUrl}
            onChange={(event) => {
              setUrlError(null)
              setSolutionUrl(event.target.value)
            }}
            placeholder="https://example.com/solution"
            aria-invalid={Boolean(urlError)}
          />
          {urlError ? (
            <p className="text-sm text-destructive">{urlError}</p>
          ) : null}
        </div>

        {saveError ? (
          <p className="text-sm text-destructive">{saveError}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2 border-t bg-background p-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
          {isPersisted ? 'Delete' : 'Discard'}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving…' : isPersisted ? 'Save changes' : 'Save exercise'}
        </Button>
      </div>
    </div>
  )
}

export function createEmptyExerciseDraft(): LocalExerciseDraft {
  return {
    localId: crypto.randomUUID(),
    title: '',
    description: '',
    difficulty: 'easy',
    solution_url: '',
  }
}
