import { isAxiosError } from 'axios'
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from 'react'

import { formReducer } from '@/components/dialogs/step-edit/formReducer'
import {
  buildInitialFormState,
  hasLocalEditData,
  type StepFormState,
} from '@/components/dialogs/step-edit/helpers'
import { isValidUrl, mapApiResources } from '@/components/dialogs/step-edit/utils'
import { useExercises } from '@/hooks/useExercises'
import type { EditTarget, StepEditPayload } from '@/hooks/useRoadmapEditor'
import { useQuizzes } from '@/hooks/useQuizzes'
import { useCreateStep, useStep, useUpdateStep } from '@/hooks/useStep'
import { stepsApi } from '@/lib/api/steps'
import type { UpdateStepInput } from '@/types/step'
import type { LocalStepResource, RoadmapNode, StepPriority } from '@/types/roadmap'

export type ActiveTab = 'content' | 'resources' | 'exercises' | 'quizzes'

export type StepEditContextValue = {
  formState: StepFormState | null
  patchForm: (patch: Partial<StepFormState>) => void
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  labelError: string | null
  urlError: string | null
  saveError: string | null
  clearLabelError: () => void
  clearUrlError: () => void
  selectedSlug: string | null
  stepId: number | null
  stepKindLabel: string
  isLoading: boolean
  isSaving: boolean
  exerciseCount: number
  quizCount: number
  handleSave: () => void
  onCancel: () => void
}

function getSaveErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === 'string') {
      return data
    }
    if (data && typeof data === 'object') {
      const messages = Object.entries(data).flatMap(([field, value]) => {
        if (Array.isArray(value)) {
          return value.map((message) => `${field}: ${String(message)}`)
        }
        return [`${field}: ${String(value)}`]
      })
      if (messages.length > 0) {
        return messages.join(' ')
      }
    }
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Failed to save step.'
}

function resolveParentStepId(
  node: RoadmapNode,
  getNodeById: (nodeId: string) => RoadmapNode | undefined,
): number {
  if (node.data.stepKind !== 'sub' || !node.data.parentNodeId) {
    throw new Error('Sub step is missing a parent node reference.')
  }

  const parentNode = getNodeById(node.data.parentNodeId)
  if (!parentNode?.data.stepId) {
    throw new Error('Save the parent step to the server before saving this sub step.')
  }

  return parentNode.data.stepId
}

async function persistResources(
  slug: string,
  stepId: number,
  resources: LocalStepResource[],
): Promise<LocalStepResource[]> {
  const persistedResources: LocalStepResource[] = []

  for (const [index, resource] of resources.entries()) {
    if (resource.id) {
      persistedResources.push({ ...resource, order: index })
      continue
    }

    const created = await stepsApi.createResource(slug, stepId, {
      title: resource.title,
      description: resource.description,
      url: resource.url,
      resource_type: resource.resource_type,
      is_free: resource.is_free,
    })

    persistedResources.push({
      localId: resource.localId,
      id: created.id,
      title: created.title,
      description: created.description,
      url: created.url,
      resource_type: created.resource_type,
      is_free: created.is_free,
      order: index,
    })
  }

  return persistedResources
}

export const StepEditContext = createContext<StepEditContextValue | null>(null)

type StepEditProviderProps = {
  target: EditTarget | null
  selectedSlug: string | null
  getNodeById: (nodeId: string) => RoadmapNode | undefined
  onSave: (payload: StepEditPayload) => void
  onCancel: () => void
  children: ReactNode
}

export function StepEditProvider({
  target,
  selectedSlug,
  getNodeById,
  onSave,
  onCancel,
  children,
}: StepEditProviderProps) {
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
  const createStep = useCreateStep()
  const updateStep = useUpdateStep()

  const stepId = node?.data.stepId ?? null
  const { data: exercisesData } = useExercises(selectedSlug ?? '', {
    step: stepId ?? undefined,
  })
  const exerciseCount = exercisesData?.results.length ?? 0
  const { data: quizzesData } = useQuizzes(selectedSlug ?? '', {
    step: stepId ?? undefined,
  })
  const quizCount = quizzesData?.results.length ?? 0

  const [activeTab, setActiveTab] = useState<ActiveTab>('content')
  const [formState, dispatchForm] = useReducer(formReducer, null)
  const [labelError, setLabelError] = useState<string | null>(null)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!target || !node) {
      dispatchForm({ type: 'clear' })
      setActiveTab('content')
      setLabelError(null)
      setUrlError(null)
      setSaveError(null)
      return
    }

    dispatchForm({ type: 'reset', state: buildInitialFormState(node) })
    setLabelError(null)
    setUrlError(null)
    setSaveError(null)
  }, [node, target])

  useEffect(() => {
    if (!stepDetail || !node || hasLocalEditData(node)) {
      return
    }

    dispatchForm({
      type: 'reset',
      state: {
        label: node.data.label,
        content: stepDetail.content,
        priority: (stepDetail.priority as StepPriority) ?? 'required',
        resources: mapApiResources(stepDetail.resources),
      },
    })
  }, [node, stepDetail])

  const isLoading = shouldFetchDetail && isStepLoading
  const isSaving = createStep.isPending || updateStep.isPending
  const stepKindLabel =
    node?.data.stepKind === 'main' ? 'main step' : 'sub step'

  const patchForm = useCallback((patch: Partial<StepFormState>) => {
    dispatchForm({ type: 'patch', patch })
  }, [])

  const clearLabelError = useCallback(() => setLabelError(null), [])
  const clearUrlError = useCallback(() => setUrlError(null), [])

  const handleSave = useCallback(() => {
    if (!formState || !node) {
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

    const payload: StepEditPayload = {
      label: trimmedLabel,
      content: formState.content,
      priority: formState.priority,
      resources: formState.resources,
    }

    setLabelError(null)
    setUrlError(null)
    setSaveError(null)

    if (!selectedSlug) {
      onSave(payload)
      return
    }

    void (async () => {
      try {
        let persistedStepId = stepId
        let persistedResources = formState.resources

        if (!stepId) {
          const parent =
            node.data.stepKind === 'sub'
              ? resolveParentStepId(node, getNodeById)
              : null

          const created = await createStep.mutateAsync({
            slug: selectedSlug,
            input: {
              parent,
              title: trimmedLabel,
              content: formState.content,
              priority: formState.priority,
              position_x: Math.round(node.position.x),
              position_y: Math.round(node.position.y),
            },
          })

          persistedStepId = created.id
          persistedResources = await persistResources(
            selectedSlug,
            created.id,
            formState.resources,
          )
        } else {
          const input: UpdateStepInput = {
            title: trimmedLabel,
            content: formState.content,
            priority: formState.priority,
          }

          await updateStep.mutateAsync({
            slug: selectedSlug,
            id: stepId,
            input,
          })

          persistedResources = await persistResources(
            selectedSlug,
            stepId,
            formState.resources,
          )
        }

        onSave({
          ...payload,
          stepId: persistedStepId ?? undefined,
          resources: persistedResources,
        })
      } catch (error) {
        setSaveError(getSaveErrorMessage(error))
      }
    })()
  }, [
    createStep,
    formState,
    getNodeById,
    node,
    onSave,
    selectedSlug,
    stepId,
    updateStep,
  ])

  const value: StepEditContextValue = {
    formState,
    patchForm,
    activeTab,
    setActiveTab,
    labelError,
    urlError,
    saveError,
    clearLabelError,
    clearUrlError,
    selectedSlug,
    stepId,
    stepKindLabel,
    isLoading,
    isSaving,
    exerciseCount,
    quizCount,
    handleSave,
    onCancel,
  }

  return <StepEditContext value={value}>{children}</StepEditContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStepEditContext() {
  const context = use(StepEditContext)

  if (!context) {
    throw new Error('useStepEditContext must be used within StepEditProvider')
  }

  return context
}
