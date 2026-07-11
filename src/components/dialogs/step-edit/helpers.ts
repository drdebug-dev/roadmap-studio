import type { LocalStepResource, RoadmapNode, StepPriority } from '@/types/roadmap'

export type StepFormState = {
  label: string
  content: string
  priority: StepPriority
  resources: LocalStepResource[]
}

export function buildInitialFormState(node: RoadmapNode): StepFormState {
  return {
    label: node.data.label,
    content: node.data.content ?? '',
    priority: node.data.priority ?? 'required',
    resources: node.data.resources ?? [],
  }
}

export function hasLocalEditData(node: RoadmapNode) {
  return (
    node.data.content !== undefined || (node.data.resources?.length ?? 0) > 0
  )
}
