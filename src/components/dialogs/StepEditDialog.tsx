import { useEffect, useState } from 'react'

import {
  buildInitialFormState,
  hasLocalEditData,
  type StepFormState,
} from '@/components/dialogs/step-edit/helpers'
import { MarkdownEditorField } from '@/components/dialogs/step-edit/MarkdownEditorField'
import { QuizzesTab } from '@/components/dialogs/step-edit/QuizzesTab'
import { ResourceEditorList } from '@/components/dialogs/step-edit/ResourceEditorList'
import { isValidUrl, mapApiResources } from '@/components/dialogs/step-edit/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQuizzes } from '@/hooks/useQuizzes'
import { useStep } from '@/hooks/useStep'
import type { EditTarget, StepEditPayload } from '@/hooks/useRoadmapEditor'
import type { RoadmapNode, StepPriority } from '@/types/roadmap'

const PRIORITIES: StepPriority[] = ['required', 'recommended', 'optional']

type StepEditDialogProps = {
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
  const node = target ? getNodeById(target.nodeId) : undefined
  const shouldFetchDetail =
    Boolean(target) &&
    Boolean(node?.data.stepId) &&
    Boolean(selectedSlug) &&
    Boolean(node && !hasLocalEditData(node))

  const { data: stepDetail, isLoading: isStepLoading } = useStep(
    selectedSlug ?? '',
    node?.data.stepId ?? 0,
    { enabled: shouldFetchDetail },
  )

  const stepId = node?.data.stepId ?? null
  const { data: quizzesData } = useQuizzes(selectedSlug ?? '', {
    step: stepId ?? undefined,
  })
  const quizCount = quizzesData?.results.length ?? 0

  const [activeTab, setActiveTab] = useState('content')
  const [formState, setFormState] = useState<StepFormState | null>(null)
  const [labelError, setLabelError] = useState<string | null>(null)
  const [urlError, setUrlError] = useState<string | null>(null)

  useEffect(() => {
    if (!target || !node) {
      setFormState(null)
      setActiveTab('content')
      setLabelError(null)
      setUrlError(null)
      return
    }

    setFormState(buildInitialFormState(node))
    setActiveTab('basic')
    setLabelError(null)
    setUrlError(null)
  }, [node, target])

  useEffect(() => {
    if (!stepDetail || !node || hasLocalEditData(node)) {
      return
    }

    setFormState({
      label: node.data.label,
      content: stepDetail.content,
      priority: (stepDetail.priority as StepPriority) ?? 'required',
      resources: mapApiResources(stepDetail.resources),
    })
  }, [node, stepDetail])

  const isOpen = Boolean(target)
  const isLoading = shouldFetchDetail && isStepLoading
  const stepKindLabel = node?.data.stepKind === 'main' ? 'main step' : 'sub step'

  const handleSave = () => {
    if (!formState) {
      return
    }

    const trimmedLabel = formState.label.trim()
    if (!trimmedLabel) {
      setLabelError('Label is required.')
      setActiveTab('content')
      return
    }

    const invalidResource = formState.resources.find(
      (resource) => !isValidUrl(resource.url),
    )
    if (invalidResource) {
      setUrlError('One or more resource URLs are invalid.')
      setActiveTab('resources')
      return
    }

    setLabelError(null)
    setUrlError(null)
    onSave({
      label: trimmedLabel,
      content: formState.content,
      priority: formState.priority,
      resources: formState.resources,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {stepKindLabel}</DialogTitle>
          <DialogDescription>
            Update the label, content, priority, and resources for this step.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !formState ? (
          <div className="space-y-3 py-8">
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-64 animate-pulse rounded-md bg-muted" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="quizzes">
                Quizzes{quizCount > 0 ? ` (${quizCount})` : ''}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="step-label">Label</Label>
                  <Input
                    id="step-label"
                    value={formState.label}
                    onChange={(event) => {
                      setLabelError(null)
                      setFormState({ ...formState, label: event.target.value })
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
                      setFormState({
                        ...formState,
                        priority: value as StepPriority,
                      })
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
                  onChange={(content) => setFormState({ ...formState, content })}
                />
              ) : null}
            </TabsContent>

            <TabsContent value="resources" className="space-y-2 pt-2">
              {urlError ? (
                <p className="text-sm text-destructive">{urlError}</p>
              ) : null}
              <ResourceEditorList
                resources={formState.resources}
                onChange={(resources) =>
                  setFormState({ ...formState, resources })
                }
              />
            </TabsContent>

            <TabsContent value="quizzes" className="space-y-2 pt-2">
              {selectedSlug ? (
                <QuizzesTab slug={selectedSlug} stepId={stepId} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a roadmap before managing quizzes.
                </p>
              )}
            </TabsContent>
          </Tabs>
        )}

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
      </DialogContent>
    </Dialog>
  )
}
