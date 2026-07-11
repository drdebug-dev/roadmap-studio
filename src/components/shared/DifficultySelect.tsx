import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDifficultyLabel } from '@/lib/quiz-validation'
import type { ExerciseDifficulty } from '@/types/exercise'
import type { QuizDifficulty } from '@/types/quiz'

const DIFFICULTIES: (ExerciseDifficulty | QuizDifficulty)[] = [
  'easy',
  'medium',
  'advanced',
]

type DifficultySelectProps = {
  id?: string
  value: ExerciseDifficulty | QuizDifficulty
  onChange: (value: ExerciseDifficulty | QuizDifficulty) => void
  disabled?: boolean
}

export function DifficultySelect({
  id,
  value,
  onChange,
  disabled = false,
}: DifficultySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Difficulty</Label>
      <Select
        value={value}
        onValueChange={(nextValue) =>
          onChange(nextValue as ExerciseDifficulty | QuizDifficulty)
        }
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Select difficulty" />
        </SelectTrigger>
        <SelectContent>
          {DIFFICULTIES.map((difficulty) => (
            <SelectItem key={difficulty} value={difficulty}>
              {formatDifficultyLabel(difficulty)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
