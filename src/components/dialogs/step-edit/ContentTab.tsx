import { MarkdownEditorField } from '@/components/dialogs/step-edit/MarkdownEditorField'
import { useStepEditContext } from '@/components/dialogs/step-edit/StepEditContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StepPriority } from '@/types/roadmap'

const PRIORITIES: StepPriority[] = ['required', 'recommended', 'optional']

export function ContentTab() {
  const {
    formState,
    activeTab,
    labelError,
    patchForm,
    clearLabelError,
  } = useStepEditContext()

  if (!formState) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="step-label">Label</Label>
          <Input
            id="step-label"
            value={formState.label}
            onChange={(event) => {
              clearLabelError()
              patchForm({ label: event.target.value })
            }}
            placeholder="Step label"
            aria-invalid={Boolean(labelError)}
          />
          {labelError ? (
            <p className="text-sm text-destructive">{labelError}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={formState.priority}
            onValueChange={(value) =>
              patchForm({ priority: value as StepPriority })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeTab === 'content' ? (
        <MarkdownEditorField
          value={formState.content}
          onChange={(content) => patchForm({ content })}
        />
      ) : null}
    </div>
  )
}
