import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { DeleteTarget } from '@/hooks/useRoadmapEditor'

type DeleteConfirmDialogProps = {
  target: DeleteTarget | null
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmDialog({
  target,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const isMain = target?.stepKind === 'main'
  const hasCascade = (target?.cascadeCount ?? 0) > 0

  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {isMain ? 'main step' : 'sub step'}</DialogTitle>
          <DialogDescription>
            {isMain && hasCascade
              ? `Are you sure you want to delete "${target?.label}"? ${target?.cascadeCount} related sub step(s) will also be removed.`
              : `Are you sure you want to delete "${target?.label}"? This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
