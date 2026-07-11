import type { Edge, Node } from '@xyflow/react'

export type StepKind = 'main' | 'sub'

export type EdgeKind = 'flow' | 'dependency'

export type StepPriority = 'required' | 'recommended' | 'optional'

export type ResourceType =
  | 'official'
  | 'article'
  | 'book'
  | 'video'
  | 'course'
  | 'roadmap'

export type LocalStepResource = {
  localId: string
  id?: number
  title: string
  description: string
  url: string
  resource_type: ResourceType
  is_free: boolean
  order: number
}

export type RoadmapNodeData = {
  label: string
  stepKind: StepKind
  stepId?: number
  parentNodeId?: string
  order?: number
  priority?: StepPriority
  content?: string
  resources?: LocalStepResource[]
}

export type RoadmapEdgeData = {
  edgeKind: EdgeKind
}

export type RoadmapNode = Node<RoadmapNodeData, 'mainStep' | 'subStep'>
export type RoadmapEdge = Edge<RoadmapEdgeData, 'flow' | 'dependency'>

export type LocalRoadmapState = {
  nodes: RoadmapNode[]
  edges: RoadmapEdge[]
}

export const NODE_TYPE_BY_KIND: Record<StepKind, RoadmapNode['type']> = {
  main: 'mainStep',
  sub: 'subStep',
}

export const EDGE_TYPE_BY_KIND: Record<EdgeKind, RoadmapEdge['type']> = {
  flow: 'flow',
  dependency: 'dependency',
}
