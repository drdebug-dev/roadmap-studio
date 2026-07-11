import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { QuestionType } from '@/types/quiz'

const QUESTION_TYPES: QuestionType[] = [
  'single_choice',
  'multiple_choice',
  'true_false',
]

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: 'Single choice',
  multiple_choice: 'Multiple choice',
  true_false: 'True / false',
}

type QuestionTypeSelectProps = {
  id?: string
  value: QuestionType
  onChange: (value: QuestionType) => void
  disabled?: boolean
}

export function QuestionTypeSelect({
  id,
  value,
  onChange,
  disabled = false,
}: QuestionTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Question type</Label>
      <Select
        value={value}
        onValueChange={(nextValue) => onChange(nextValue as QuestionType)}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {QUESTION_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {QUESTION_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { QUESTION_TYPE_LABELS }
