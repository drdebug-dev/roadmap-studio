import { useStepEditContext } from '@/components/dialogs/step-edit/StepEditContext'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'

export function StepEditFooter() {
  const { formState, isLoading, isSaving, handleSave, onCancel } =
    useStepEditContext()

  return (
    <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
        Cancel
      </Button>
      <Button
        type="button"
        onClick={handleSave}
        disabled={isLoading || isSaving || !formState}
      >
        {isSaving ? 'Saving…' : 'Save'}
      </Button>
    </DialogFooter>
  )
}
