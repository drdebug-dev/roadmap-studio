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
import { useStep } from '@/hooks/useStep'
import type { RoadmapNode, StepPriority } from '@/types/roadmap'

export type ActiveTab = 'content' | 'resources' | 'exercises' | 'quizzes'

export type StepEditContextValue = {
  formState: StepFormState | null
  patchForm: (patch: Partial<StepFormState>) => void
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  labelError: string | null
  urlError: string | null
  clearLabelError: () => void
  clearUrlError: () => void
  selectedSlug: string | null
  stepId: number | null
  stepKindLabel: string
  isLoading: boolean
  exerciseCount: number
  quizCount: number
  handleSave: () => void
  onCancel: () => void
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

  useEffect(() => {
    if (!target || !node) {
      dispatchForm({ type: 'clear' })
      setActiveTab('content')
      setLabelError(null)
      setUrlError(null)
      return
    }

    dispatchForm({ type: 'reset', state: buildInitialFormState(node) })
    setLabelError(null)
    setUrlError(null)
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
  const stepKindLabel =
    node?.data.stepKind === 'main' ? 'main step' : 'sub step'

  const patchForm = useCallback((patch: Partial<StepFormState>) => {
    dispatchForm({ type: 'patch', patch })
  }, [])

  const clearLabelError = useCallback(() => setLabelError(null), [])
  const clearUrlError = useCallback(() => setUrlError(null), [])

  const handleSave = useCallback(() => {
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
  }, [formState, onSave])

  const value: StepEditContextValue = {
    formState,
    patchForm,
    activeTab,
    setActiveTab,
    labelError,
    urlError,
    clearLabelError,
    clearUrlError,
    selectedSlug,
    stepId,
    stepKindLabel,
    isLoading,
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
