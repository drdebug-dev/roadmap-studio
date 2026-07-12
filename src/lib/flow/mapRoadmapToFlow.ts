import type {
  RoadmapConnection,
  RoadmapDetail,
  RoadmapStep,
} from '@/types/roadmap-api'
import type {
  EdgeKind,
  LocalRoadmapState,
  LocalStepResource,
  RoadmapEdge,
  RoadmapNode,
  StepPriority,
} from '@/types/roadmap'
import {
  EDGE_TYPE_BY_KIND,
  NODE_TYPE_BY_KIND,
} from '@/types/roadmap'

function stepToNodeId(stepId: number) {
  return `step-${stepId}`
}

function normalizePriority(priority: string): StepPriority {
  if (
    priority === 'required' ||
    priority === 'recommended' ||
    priority === 'optional'
  ) {
    return priority
  }

  return 'required'
}

function mapSubSteps(
  steps: RoadmapStep[],
  parentNodeId: string,
  nodes: RoadmapNode[],
  edges: RoadmapEdge[],
) {
  for (const step of steps) {
    const nodeId = stepToNodeId(step.id)

    nodes.push({
      id: nodeId,
      type: NODE_TYPE_BY_KIND.sub,
      position: { x: step.position_x, y: step.position_y },
      data: {
        label: step.title,
        stepKind: 'sub',
        stepId: step.id,
        parentNodeId,
        order: step.order,
        priority: normalizePriority(step.priority),
      },
    })

    edges.push({
      id: `dep-${nodeId}-${parentNodeId}`,
      source: nodeId,
      target: parentNodeId,
      type: EDGE_TYPE_BY_KIND.dependency,
      data: { edgeKind: 'dependency' },
    })

    if (step.children.length > 0) {
      mapSubSteps(step.children, parentNodeId, nodes, edges)
    }
  }
}

export function mapRoadmapToFlow(roadmap: RoadmapDetail): LocalRoadmapState {
  const nodes: RoadmapNode[] = []
  const edges: RoadmapEdge[] = []

  for (const step of roadmap.steps) {
    const nodeId = stepToNodeId(step.id)

    nodes.push({
      id: nodeId,
      type: NODE_TYPE_BY_KIND.main,
      position: { x: step.position_x, y: step.position_y },
      data: {
        label: step.title,
        stepKind: 'main',
        stepId: step.id,
        order: step.order,
        priority: normalizePriority(step.priority),
      },
    })

    if (step.children.length > 0) {
      mapSubSteps(step.children, nodeId, nodes, edges)
    }
  }

  for (const connection of roadmap.connections) {
    const source = stepToNodeId(connection.from_step)
    const target = stepToNodeId(connection.to_step)

    edges.push({
      id: `flow-${connection.id}`,
      source,
      target,
      type: EDGE_TYPE_BY_KIND.flow,
      data: { edgeKind: 'flow' },
    })
  }

  return { nodes, edges }
}

export function mapFlowToRoadmapState(state: LocalRoadmapState) {
  const mapResources = (node: RoadmapNode) =>
    (node.data.resources ?? []).map((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      url: resource.url,
      resource_type: resource.resource_type,
      is_free: resource.is_free,
      order: resource.order,
    }))

  const mainSteps = state.nodes
    .filter((node) => node.data.stepKind === 'main')
    .map((node) => ({
      id: node.data.stepId,
      title: node.data.label,
      content: node.data.content ?? '',
      priority: node.data.priority ?? 'required',
      order: node.data.order ?? 0,
      position_x: node.position.x,
      position_y: node.position.y,
      resources: mapResources(node),
      children: state.nodes
        .filter(
          (child) =>
            child.data.stepKind === 'sub' &&
            child.data.parentNodeId === node.id,
        )
        .map((child) => ({
          id: child.data.stepId,
          title: child.data.label,
          content: child.data.content ?? '',
          priority: child.data.priority ?? 'required',
          order: child.data.order ?? 0,
          position_x: child.position.x,
          position_y: child.position.y,
          resources: mapResources(child),
        })),
    }))

  const connections = state.edges
    .filter((edge) => edge.data?.edgeKind === 'flow')
    .map((edge) => ({
      from_step: parseStepId(edge.source),
      to_step: parseStepId(edge.target),
    }))

  return { steps: mainSteps, connections }
}

function parseStepId(nodeId: string) {
  return Number(nodeId.replace('step-', ''))
}

export function resolveNodeToStepId(
  nodeId: string,
  state: LocalRoadmapState,
  nodeIdToStepId: Map<string, number>,
): number | null {
  const mappedId = nodeIdToStepId.get(nodeId)
  if (mappedId) {
    return mappedId
  }

  const node = state.nodes.find((entry) => entry.id === nodeId)
  if (node?.data.stepId) {
    return node.data.stepId
  }

  if (nodeId.startsWith('step-')) {
    const parsedId = parseStepId(nodeId)
    return Number.isFinite(parsedId) ? parsedId : null
  }

  return null
}

export function seedNodeIdToStepIdMap(state: LocalRoadmapState) {
  const nodeIdToStepId = new Map<string, number>()

  for (const node of state.nodes) {
    if (node.data.stepId) {
      nodeIdToStepId.set(node.id, node.data.stepId)
      continue
    }

    if (node.id.startsWith('step-')) {
      const parsedId = parseStepId(node.id)
      if (Number.isFinite(parsedId)) {
        nodeIdToStepId.set(node.id, parsedId)
      }
    }
  }

  return nodeIdToStepId
}

export function collectNewFlowConnections(
  state: LocalRoadmapState,
  nodeIdToStepId: Map<string, number>,
) {
  return state.edges
    .filter(
      (edge) =>
        edge.data?.edgeKind === 'flow' && edge.id.startsWith('local-edge-'),
    )
    .map((edge) => {
      const fromStep = resolveNodeToStepId(edge.source, state, nodeIdToStepId)
      const toStep = resolveNodeToStepId(edge.target, state, nodeIdToStepId)

      if (!fromStep || !toStep) {
        return null
      }

      return {
        edgeId: edge.id,
        from_step: fromStep,
        to_step: toStep,
      }
    })
    .filter(
      (
        connection,
      ): connection is {
        edgeId: string
        from_step: number
        to_step: number
      } => connection !== null,
    )
}

export type NewStepForCreate = {
  nodeId: string
  stepKind: 'main' | 'sub'
  parentNodeId?: string
  title: string
  content: string
  priority: StepPriority
  position_x: number
  position_y: number
  resources: Array<
    Pick<
      LocalStepResource,
      'title' | 'description' | 'url' | 'resource_type' | 'is_free' | 'order'
    >
  >
}

export function collectNewStepsForCreate(
  state: LocalRoadmapState,
): NewStepForCreate[] {
  const mapResources = (node: RoadmapNode) =>
    (node.data.resources ?? [])
      .filter((resource) => !resource.id)
      .map((resource) => ({
        title: resource.title,
        description: resource.description,
        url: resource.url,
        resource_type: resource.resource_type,
        is_free: resource.is_free,
        order: resource.order,
      }))

  const newMainSteps = state.nodes
    .filter((node) => node.data.stepKind === 'main' && !node.data.stepId)
    .map((node) => ({
      nodeId: node.id,
      stepKind: 'main' as const,
      title: node.data.label,
      content: node.data.content ?? '',
      priority: node.data.priority ?? 'required',
      position_x: Math.round(node.position.x),
      position_y: Math.round(node.position.y),
      resources: mapResources(node),
    }))

  const newSubSteps = state.nodes
    .filter((node) => node.data.stepKind === 'sub' && !node.data.stepId)
    .map((node) => ({
      nodeId: node.id,
      stepKind: 'sub' as const,
      parentNodeId: node.data.parentNodeId,
      title: node.data.label,
      content: node.data.content ?? '',
      priority: node.data.priority ?? 'required',
      position_x: Math.round(node.position.x),
      position_y: Math.round(node.position.y),
      resources: mapResources(node),
    }))

  return [...newMainSteps, ...newSubSteps]
}

export function createEmptyFlowState(): LocalRoadmapState {
  return { nodes: [], edges: [] }
}

export function getEdgeKindForConnection(
  sourceNode: RoadmapNode,
  targetNode: RoadmapNode,
): EdgeKind | null {
  if (sourceNode.data.stepKind === 'main' && targetNode.data.stepKind === 'main') {
    return 'flow'
  }

  if (sourceNode.data.stepKind === 'sub' && targetNode.data.stepKind === 'main') {
    return 'dependency'
  }

  return null
}

export function createLocalStepId() {
  return `local-${crypto.randomUUID()}`
}

export function createLocalConnectionId() {
  return `local-edge-${crypto.randomUUID()}`
}

export type { RoadmapConnection }
