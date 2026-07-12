import { useStepEditContext } from '@/components/dialogs/step-edit/StepEditContext'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function StepEditHeader() {
  const { stepKindLabel } = useStepEditContext()

  return (
    <DialogHeader>
      <DialogTitle>Edit {stepKindLabel}</DialogTitle>
      <DialogDescription>
        Update the label, content, priority, and resources for this step.
      </DialogDescription>
    </DialogHeader>
  )
}
