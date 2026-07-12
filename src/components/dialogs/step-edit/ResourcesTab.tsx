import { ResourceEditorList } from '@/components/dialogs/step-edit/ResourceEditorList'
import { useStepEditContext } from '@/components/dialogs/step-edit/StepEditContext'

export function ResourcesTab() {
  const { formState, urlError, patchForm } = useStepEditContext()

  if (!formState) {
    return null
  }

  return (
    <div className="space-y-2">
      {urlError ? (
        <p className="text-sm text-destructive">{urlError}</p>
      ) : null}
      <ResourceEditorList
        resources={formState.resources}
        onChange={(resources) => patchForm({ resources })}
      />
    </div>
  )
}
