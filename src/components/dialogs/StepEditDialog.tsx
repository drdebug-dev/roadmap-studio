import { StepEditBody } from '@/components/dialogs/step-edit/StepEditBody'
import { StepEditFooter } from '@/components/dialogs/step-edit/StepEditFooter'
import { StepEditHeader } from '@/components/dialogs/step-edit/StepEditHeader'
import { StepEditProvider } from '@/components/dialogs/step-edit/StepEditContext'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { EditTarget, StepEditPayload } from '@/hooks/useRoadmapEditor'
import type { RoadmapNode } from '@/types/roadmap'

export type StepEditDialogProps = {
  target: EditTarget | null
  selectedSlug: string | null
  getNodeById: (nodeId: string) => RoadmapNode | undefined
  onSave: (payload: StepEditPayload) => void
  onCancel: () => void
}

export function StepEditDialog({
  target,
  selectedSlug,
  getNodeById,
  onSave,
  onCancel,
}: StepEditDialogProps) {
  const isOpen = Boolean(target)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <StepEditProvider
          target={target}
          selectedSlug={selectedSlug}
          getNodeById={getNodeById}
          onSave={onSave}
          onCancel={onCancel}
        >
          <StepEditHeader />
          <StepEditBody />
          <StepEditFooter />
        </StepEditProvider>
      </DialogContent>
    </Dialog>
  )
}
