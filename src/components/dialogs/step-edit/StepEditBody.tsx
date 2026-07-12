import { StepEditTabs } from '@/components/dialogs/step-edit/StepEditTabs'
import { useStepEditContext } from '@/components/dialogs/step-edit/StepEditContext'

export function StepEditBody() {
  const { isLoading, formState } = useStepEditContext()

  if (isLoading || !formState) {
    return (
      <div className="space-y-3 py-8">
        <div className="h-10 animate-pulse rounded-md bg-muted" />
        <div className="h-64 animate-pulse rounded-md bg-muted" />
      </div>
    )
  }

  return <StepEditTabs />
}
