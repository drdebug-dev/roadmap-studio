import { useStepEditContext } from '@/components/dialogs/step-edit/StepEditContext'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'

export function StepEditFooter() {
  const { formState, isLoading, handleSave, onCancel } = useStepEditContext()

  return (
    <DialogFooter className="gap-2 sm:gap-0">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        type="button"
        onClick={handleSave}
        disabled={isLoading || !formState}
      >
        Save
      </Button>
    </DialogFooter>
  )
}
