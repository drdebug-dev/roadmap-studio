import {
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type IsValidConnection,
  type OnConnect,
} from '@xyflow/react'
import { useCallback, useMemo, useRef, useState } from 'react'

import {
  createLocalConnectionId,
  createLocalStepId,
  getEdgeKindForConnection,
} from '@/lib/flow/mapRoadmapToFlow'
import type {
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

export type DeleteTarget = {
  nodeId: string
  label: string
  stepKind: 'main' | 'sub'
  cascadeCount: number
}

export type EditTarget = {
  nodeId: string
}

export type StepEditPayload = {
  label: string
  content: string
  priority: StepPriority
  resources: LocalStepResource[]
  stepId?: number
}

type UseRoadmapEditorOptions = {
  onDirty?: () => void
}

export function useRoadmapEditor({
  onDirty,
}: UseRoadmapEditorOptions = {}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<RoadmapNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<RoadmapEdge>([])
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null)
  const { screenToFlowPosition, fitView } = useReactFlow()
  const loadedStateKeyRef = useRef<string | null>(null)

  const markDirty = useCallback(() => {
    onDirty?.()
  }, [onDirty])

  const loadState = useCallback(
    (state: LocalRoadmapState, stateKey: string, options?: { force?: boolean }) => {
      if (!options?.force && loadedStateKeyRef.current === stateKey) {
        return
      }

      loadedStateKeyRef.current = stateKey
      setNodes(state.nodes)
      setEdges(state.edges)
      window.requestAnimationFrame(() => {
        fitView({ padding: 0.2, duration: 300 })
      })
    },
    [fitView, setEdges, setNodes],
  )

  const getNodeById = useCallback(
    (nodeId: string) => nodes.find((node) => node.id === nodeId),
    [nodes],
  )

  const getSubStepCountForMain = useCallback(
    (mainNodeId: string) =>
      nodes.filter(
        (node) =>
          node.data.stepKind === 'sub' && node.data.parentNodeId === mainNodeId,
      ).length,
    [nodes],
  )

  const addMainStep = useCallback(() => {
    const id = createLocalStepId()
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    })

    setNodes((currentNodes) => [
      ...currentNodes,
      {
        id,
        type: NODE_TYPE_BY_KIND.main,
        position,
        data: {
          label: 'New main step',
          stepKind: 'main',
          order: currentNodes.filter((node) => node.data.stepKind === 'main')
            .length,
          priority: 'required',
        },
      },
    ])
    markDirty()
  }, [markDirty, screenToFlowPosition, setNodes])

  const addSubStep = useCallback(
    (parentNodeId: string) => {
      const parentNode = getNodeById(parentNodeId)
      if (!parentNode || parentNode.data.stepKind !== 'main') {
        return
      }

      const siblingCount = getSubStepCountForMain(parentNodeId)
      const id = createLocalStepId()

      setNodes((currentNodes) => [
        ...currentNodes,
        {
          id,
          type: NODE_TYPE_BY_KIND.sub,
          position: {
            x: parentNode.position.x + 40,
            y: parentNode.position.y + 120 + siblingCount * 80,
          },
          data: {
            label: 'New sub step',
            stepKind: 'sub',
            parentNodeId,
            order: siblingCount,
            priority: 'optional',
          },
        },
      ])

      setEdges((currentEdges) => [
        ...currentEdges,
        {
          id: createLocalConnectionId(),
          source: id,
          target: parentNodeId,
          type: EDGE_TYPE_BY_KIND.dependency,
          data: { edgeKind: 'dependency' },
        },
      ])

      markDirty()
    },
    [getNodeById, getSubStepCountForMain, markDirty, setEdges, setNodes],
  )

  const requestDeleteNode = useCallback(
    (nodeId: string) => {
      const node = getNodeById(nodeId)
      if (!node) {
        return
      }

      const cascadeCount =
        node.data.stepKind === 'main'
          ? getSubStepCountForMain(nodeId)
          : 0

      setDeleteTarget({
        nodeId,
        label: node.data.label,
        stepKind: node.data.stepKind,
        cascadeCount,
      })
    },
    [getNodeById, getSubStepCountForMain],
  )

  const confirmDeleteNode = useCallback(() => {
    if (!deleteTarget) {
      return
    }

    const { nodeId, stepKind } = deleteTarget
    const subNodeIds =
      stepKind === 'main'
        ? nodes
            .filter(
              (node) =>
                node.data.stepKind === 'sub' &&
                node.data.parentNodeId === nodeId,
            )
            .map((node) => node.id)
        : []

    const removedIds = new Set([nodeId, ...subNodeIds])

    setNodes((currentNodes) =>
      currentNodes.filter((node) => !removedIds.has(node.id)),
    )
    setEdges((currentEdges) =>
      currentEdges.filter(
        (edge) => !removedIds.has(edge.source) && !removedIds.has(edge.target),
      ),
    )

    setDeleteTarget(null)
    markDirty()
  }, [deleteTarget, markDirty, nodes, setEdges, setNodes])

  const cancelDeleteNode = useCallback(() => {
    setDeleteTarget(null)
  }, [])

  const requestEditStep = useCallback((nodeId: string) => {
    setEditTarget({ nodeId })
  }, [])

  const cancelEditStep = useCallback(() => {
    setEditTarget(null)
  }, [])

  const confirmSaveStep = useCallback(
    (payload: StepEditPayload) => {
      if (!editTarget) {
        return
      }

      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === editTarget.nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  label: payload.label,
                  content: payload.content,
                  priority: payload.priority,
                  resources: payload.resources,
                  ...(payload.stepId !== undefined
                    ? { stepId: payload.stepId }
                    : {}),
                },
              }
            : node,
        ),
      )

      setEditTarget(null)

      if (!payload.stepId) {
        markDirty()
      }
    },
    [editTarget, markDirty, setNodes],
  )

  const isValidConnection: IsValidConnection<RoadmapEdge> = useCallback(
    (connection) => {
      if (!connection.source || !connection.target) {
        return false
      }

      if (connection.source === connection.target) {
        return false
      }

      const sourceNode = getNodeById(connection.source)
      const targetNode = getNodeById(connection.target)

      if (!sourceNode || !targetNode) {
        return false
      }

      return getEdgeKindForConnection(sourceNode, targetNode) !== null
    },
    [getNodeById],
  )

  const onConnect: OnConnect = useCallback(
    (connection) => {
      const sourceNode = connection.source
        ? getNodeById(connection.source)
        : undefined
      const targetNode = connection.target
        ? getNodeById(connection.target)
        : undefined

      if (!sourceNode || !targetNode) {
        return
      }

      const edgeKind = getEdgeKindForConnection(sourceNode, targetNode)
      if (!edgeKind) {
        return
      }

      setEdges((currentEdges) => {
        const duplicate = currentEdges.some(
          (edge) =>
            edge.source === connection.source &&
            edge.target === connection.target,
        )

        if (duplicate) {
          return currentEdges
        }

        return addEdge(
          {
            ...connection,
            id: createLocalConnectionId(),
            type: EDGE_TYPE_BY_KIND[edgeKind],
            data: { edgeKind },
          },
          currentEdges,
        )
      })

      markDirty()
    },
    [getNodeById, markDirty, setEdges],
  )

  const selectedMainNodeId = useMemo(() => {
    const selectedMain = nodes.find(
      (node) => node.selected && node.data.stepKind === 'main',
    )
    return selectedMain?.id ?? null
  }, [nodes])

  const onNodeDragStop = useCallback(() => {
    markDirty()
  }, [markDirty])

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    addMainStep,
    addSubStep,
    requestDeleteNode,
    confirmDeleteNode,
    cancelDeleteNode,
    deleteTarget,
    editTarget,
    requestEditStep,
    confirmSaveStep,
    cancelEditStep,
    getNodeById,
    selectedMainNodeId,
    loadState,
    onNodeDragStop,
  }
}
