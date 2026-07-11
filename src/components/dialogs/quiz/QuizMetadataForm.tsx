import { DifficultySelect } from '@/components/shared/DifficultySelect'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { QuizMetadataFormState } from '@/components/dialogs/quiz/quiz-metadata-state'

type QuizMetadataFormProps = {
  value: QuizMetadataFormState
  onChange: (value: QuizMetadataFormState) => void
  disabled?: boolean
  titleError?: string | null
}

export function QuizMetadataForm({
  value,
  onChange,
  disabled = false,
  titleError = null,
}: QuizMetadataFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quiz-title">Title</Label>
        <Input
          id="quiz-title"
          value={value.title}
          onChange={(event) =>
            onChange({ ...value, title: event.target.value })
          }
          placeholder="Quiz title"
          disabled={disabled}
          aria-invalid={Boolean(titleError)}
        />
        {titleError ? (
          <p className="text-sm text-destructive">{titleError}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="quiz-description">Description</Label>
        <Input
          id="quiz-description"
          value={value.description}
          onChange={(event) =>
            onChange({ ...value, description: event.target.value })
          }
          placeholder="Short description"
          disabled={disabled}
        />
      </div>

      <DifficultySelect
        id="quiz-difficulty"
        value={value.difficulty}
        onChange={(difficulty) => onChange({ ...value, difficulty })}
        disabled={disabled}
      />
    </div>
  )
}
