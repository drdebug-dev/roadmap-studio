import { useState } from 'react'

import {
  DeleteConfirmDialog,
  getNamedDeleteDescription,
} from '@/components/dialogs/DeleteConfirmDialog'
import { ResourceEditorList } from '@/components/dialogs/step-edit/ResourceEditorList'
import { useStepEditContext } from '@/components/dialogs/step-edit/StepEditContext'
import { useDeleteResource } from '@/hooks/useStep'
import type { LocalStepResource } from '@/types/roadmap'

export function ResourcesTab() {
  const { formState, urlError, patchForm, selectedSlug, stepId } =
    useStepEditContext()
  const [deleteTarget, setDeleteTarget] = useState<LocalStepResource | null>(
    null,
  )
  const deleteResource = useDeleteResource()

  if (!formState) {
    return null
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return
    }

    try {
      if (deleteTarget.id && stepId && selectedSlug) {
        await deleteResource.mutateAsync({
          slug: selectedSlug,
          stepId,
          resourceId: deleteTarget.id,
        })
      }

      patchForm({
        resources: formState.resources
          .filter((resource) => resource.localId !== deleteTarget.localId)
          .map((resource, index) => ({ ...resource, order: index })),
      })
      setDeleteTarget(null)
    } catch {
      // Global mutation toast handles API errors.
    }
  }

  const handleCancelDelete = () => {
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-2">
      {urlError ? (
        <p className="text-sm text-destructive">{urlError}</p>
      ) : null}
      <ResourceEditorList
        resources={formState.resources}
        onChange={(resources) => patchForm({ resources })}
        onDeleteRequest={(resource) => setDeleteTarget(resource)}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        title="Delete resource"
        description={
          deleteTarget
            ? getNamedDeleteDescription(deleteTarget.title)
            : ''
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isPending={deleteResource.isPending}
      />
    </div>
  )
}
