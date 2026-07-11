import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateQuizChoiceInput, QuestionType } from '@/types/quiz'

type ChoiceEditorListProps = {
  groupName: string
  questionType: QuestionType
  choices: CreateQuizChoiceInput[]
  onChange: (choices: CreateQuizChoiceInput[]) => void
  disabled?: boolean
}

export function ChoiceEditorList({
  groupName,
  questionType,
  choices,
  onChange,
  disabled = false,
}: ChoiceEditorListProps) {
  const isTrueFalse = questionType === 'true_false'
  const isSingleChoice =
    questionType === 'single_choice' || questionType === 'true_false'

  const updateChoice = (
    index: number,
    patch: Partial<CreateQuizChoiceInput>,
  ) => {
    onChange(
      choices.map((choice, choiceIndex) =>
        choiceIndex === index ? { ...choice, ...patch } : choice,
      ),
    )
  }

  const setCorrectChoice = (index: number) => {
    onChange(
      choices.map((choice, choiceIndex) => ({
        ...choice,
        is_correct: choiceIndex === index,
      })),
    )
  }

  const toggleCorrectChoice = (index: number, checked: boolean) => {
    onChange(
      choices.map((choice, choiceIndex) =>
        choiceIndex === index ? { ...choice, is_correct: checked } : choice,
      ),
    )
  }

  const addChoice = () => {
    onChange([...choices, { text: '', is_correct: false }])
  }

  const removeChoice = (index: number) => {
    onChange(choices.filter((_, choiceIndex) => choiceIndex !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Choices</Label>
        {!isTrueFalse ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addChoice}
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
            Add choice
          </Button>
        ) : null}
      </div>

      <div className="max-h-[240px] space-y-2 overflow-y-auto pr-1">
        {choices.map((choice, index) => (
          <div
            key={`choice-${index}`}
            className="flex items-center gap-2 rounded-md border p-2"
          >
            <label className="flex shrink-0 items-center gap-2 text-sm">
              <input
                type={isSingleChoice ? 'radio' : 'checkbox'}
                name={groupName}
                checked={choice.is_correct}
                onChange={(event) => {
                  if (isSingleChoice) {
                    setCorrectChoice(index)
                    return
                  }
                  toggleCorrectChoice(index, event.target.checked)
                }}
                disabled={disabled}
                className="h-4 w-4"
              />
              Correct
            </label>

            <Input
              value={choice.text}
              onChange={(event) =>
                updateChoice(index, { text: event.target.value })
              }
              placeholder={`Choice ${index + 1}`}
              disabled={disabled || isTrueFalse}
              className="flex-1"
            />

            {!isTrueFalse && choices.length > 2 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                title="Remove choice"
                onClick={() => removeChoice(index)}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
