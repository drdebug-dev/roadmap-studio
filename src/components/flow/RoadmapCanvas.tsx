import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import { Plus } from 'lucide-react'
import { useEffect, useMemo } from 'react'

import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog'
import { StepEditDialog } from '@/components/dialogs/StepEditDialog'
import { DependencyEdge } from '@/components/flow/edges/DependencyEdge'
import { FlowEdge } from '@/components/flow/edges/FlowEdge'
import { MainStepNode } from '@/components/flow/nodes/MainStepNode'
import { SubStepNode } from '@/components/flow/nodes/SubStepNode'
import { RoadmapsPanel } from '@/components/panels/RoadmapsPanel'
import { RoadmapFaqsPanel } from '@/components/panels/RoadmapFaqsPanel'
import { Button } from '@/components/ui/button'
import { RoadmapEditorProvider } from '@/contexts/RoadmapEditorContext'
import { useRoadmapEditor } from '@/hooks/useRoadmapEditor'
import type { LocalRoadmapState } from '@/types/roadmap'

const nodeTypes = {
  mainStep: MainStepNode,
  subStep: SubStepNode,
}

const edgeTypes = {
  flow: FlowEdge,
  dependency: DependencyEdge,
}

type RoadmapFlowProps = {
  selectedSlug: string | null
  setSelectedSlug: (slug: string) => void
  roadmapTitle: string | null
  flowState: LocalRoadmapState | null
  stateKey: string | null
  isDirty: boolean
  onDirty: () => void
}

function RoadmapFlow({
  selectedSlug,
  setSelectedSlug,
  roadmapTitle,
  flowState,
  stateKey,
  isDirty,
  onDirty,
}: RoadmapFlowProps) {
  const {
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
  } = useRoadmapEditor({ onDirty })

  useEffect(() => {
    if (!stateKey || !flowState) {
      return
    }

    loadState(flowState, stateKey)
  }, [flowState, loadState, stateKey])

  const contextValue = useMemo(
    () => ({
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
      selectedSlug,
      setSelectedSlug,
      roadmapTitle,
      isDirty,
    }),
    [
      addMainStep,
      addSubStep,
      cancelDeleteNode,
      cancelEditStep,
      confirmDeleteNode,
      confirmSaveStep,
      deleteTarget,
      editTarget,
      edges,
      getNodeById,
      isDirty,
      isValidConnection,
      loadState,
      nodes,
      onConnect,
      onEdgesChange,
      onNodeDragStop,
      onNodesChange,
      requestDeleteNode,
      requestEditStep,
      roadmapTitle,
      selectedMainNodeId,
      selectedSlug,
      setSelectedSlug,
    ],
  )

  return (
    <RoadmapEditorProvider value={contextValue}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onNodeDragStop={onNodeDragStop}
        deleteKeyCode={null}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) =>
            node.type === 'mainStep' ? 'var(--accent)' : 'var(--text)'
          }
        />

        <Panel position="top-right" className="flex gap-2">
          <Button type="button" size="sm" onClick={addMainStep}>
            <Plus className="h-4 w-4" />
            Main step
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={!selectedMainNodeId}
            onClick={() => {
              if (selectedMainNodeId) {
                addSubStep(selectedMainNodeId)
              }
            }}
          >
            <Plus className="h-4 w-4" />
            Sub step
          </Button>
        </Panel>

        <RoadmapsPanel />
        <RoadmapFaqsPanel />
      </ReactFlow>

      <DeleteConfirmDialog
        target={deleteTarget}
        onConfirm={confirmDeleteNode}
        onCancel={cancelDeleteNode}
      />

      <StepEditDialog
        target={editTarget}
        selectedSlug={selectedSlug}
        getNodeById={getNodeById}
        onSave={confirmSaveStep}
        onCancel={cancelEditStep}
      />
    </RoadmapEditorProvider>
  )
}

type RoadmapCanvasProps = {
  selectedSlug: string | null
  setSelectedSlug: (slug: string) => void
  roadmapTitle: string | null
  flowState: LocalRoadmapState | null
  stateKey: string | null
  isDirty: boolean
  onDirty: () => void
}

export function RoadmapCanvas(props: RoadmapCanvasProps) {
  return (
    <ReactFlowProvider>
      <div className="roadmap-canvas relative">
        <RoadmapFlow {...props} />
      </div>
    </ReactFlowProvider>
  )
}
