import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { isAxiosError } from "axios";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { StepEditDialog } from "@/components/dialogs/StepEditDialog";
import { DependencyEdge } from "@/components/flow/edges/DependencyEdge";
import { FlowEdge } from "@/components/flow/edges/FlowEdge";
import { MainStepNode } from "@/components/flow/nodes/MainStepNode";
import { SubStepNode } from "@/components/flow/nodes/SubStepNode";
import { Navbar } from "@/components/layout/Navbar";
import { RoadmapsPanel } from "@/components/panels/RoadmapsPanel";
import { RoadmapFaqsPanel } from "@/components/panels/RoadmapFaqsPanel";
import { Button } from "@/components/ui/button";
import { RoadmapEditorProvider } from "@/contexts/RoadmapEditorContext";
import { useRoadmapEditor } from "@/hooks/useRoadmapEditor";
import { useSaveRoadmapSteps } from "@/hooks/useSaveRoadmapSteps";
import { hasPendingSaveChanges } from "@/lib/flow/mapRoadmapToFlow";
import type { LocalRoadmapState } from "@/types/roadmap";

const nodeTypes = {
  mainStep: MainStepNode,
  subStep: SubStepNode,
};

const edgeTypes = {
  flow: FlowEdge,
  dependency: DependencyEdge,
};

type RoadmapFlowProps = {
  selectedSlug: string | null;
  navigateToRoadmap: (slug: string) => void;
  roadmapTitle: string | null;
  flowState: LocalRoadmapState | null;
  stateKey: string | null;
  isDirty: boolean;
  onDirty: () => void;
  onClearDirty: () => void;
  onSaveWithoutSlug: () => void;
  onSaveSuccess: () => void;
  pendingSaveAfterCreate: boolean;
  onPendingSaveHandled: () => void;
};

function getSaveErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string") {
      return data;
    }
    if (data && typeof data === "object") {
      const messages = Object.entries(data).flatMap(([field, value]) => {
        if (Array.isArray(value)) {
          return value.map((message) => `${field}: ${String(message)}`);
        }
        return [`${field}: ${String(value)}`];
      });
      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to save roadmap steps.";
}

function RoadmapFlow({
  selectedSlug,
  navigateToRoadmap,
  roadmapTitle,
  flowState,
  stateKey,
  isDirty,
  onDirty,
  onClearDirty,
  onSaveWithoutSlug,
  onSaveSuccess,
  pendingSaveAfterCreate,
  onPendingSaveHandled,
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
  } = useRoadmapEditor({ onDirty });

  const saveSteps = useSaveRoadmapSteps();
  const [saveError, setSaveError] = useState<string | null>(null);
  const pendingSaveInFlightRef = useRef(false);

  useEffect(() => {
    if (!stateKey || !flowState || isDirty) {
      return;
    }

    loadState(flowState, stateKey);
  }, [flowState, isDirty, loadState, stateKey]);

  const handleSave = useCallback(async () => {
    if (!selectedSlug) {
      onSaveWithoutSlug();
      return;
    }

    if (!isDirty || saveSteps.isPending) {
      return;
    }

    const baseline = flowState ?? { nodes: [], edges: [] };

    if (!hasPendingSaveChanges({ nodes, edges }, baseline)) {
      onClearDirty();
      return;
    }

    setSaveError(null);

    try {
      await saveSteps.mutateAsync({
        slug: selectedSlug,
        state: { nodes, edges },
        baseline,
      });
      onClearDirty();
      onSaveSuccess();
    } catch (error) {
      setSaveError(getSaveErrorMessage(error));
    }
  }, [
    edges,
    flowState,
    isDirty,
    nodes,
    onClearDirty,
    onSaveSuccess,
    onSaveWithoutSlug,
    saveSteps,
    selectedSlug,
  ]);

  useEffect(() => {
    if (
      !pendingSaveAfterCreate ||
      !selectedSlug ||
      !isDirty ||
      pendingSaveInFlightRef.current
    ) {
      return;
    }

    pendingSaveInFlightRef.current = true;

    void handleSave().finally(() => {
      pendingSaveInFlightRef.current = false;
      onPendingSaveHandled();
    });
  }, [
    handleSave,
    isDirty,
    onPendingSaveHandled,
    pendingSaveAfterCreate,
    selectedSlug,
  ]);

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
      navigateToRoadmap,
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
      navigateToRoadmap,
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
    ],
  );

  return (
    <RoadmapEditorProvider value={contextValue}>
      <Navbar
        roadmapTitle={roadmapTitle}
        isDirty={isDirty}
        isSaving={saveSteps.isPending}
        saveError={saveError}
        onSaveClick={() => {
          void handleSave();
        }}
      />

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
            node.type === "mainStep" ? "var(--accent)" : "var(--text)"
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
                addSubStep(selectedMainNodeId);
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

      {editTarget ? (
        <StepEditDialog
          target={editTarget}
          selectedSlug={selectedSlug}
          getNodeById={getNodeById}
          onSave={confirmSaveStep}
          onCancel={cancelEditStep}
        />
      ) : null}
    </RoadmapEditorProvider>
  );
}

type RoadmapCanvasProps = {
  selectedSlug: string | null;
  navigateToRoadmap: (slug: string) => void;
  roadmapTitle: string | null;
  flowState: LocalRoadmapState | null;
  stateKey: string | null;
  isDirty: boolean;
  onDirty: () => void;
  onClearDirty: () => void;
  onSaveWithoutSlug: () => void;
  onSaveSuccess: () => void;
  pendingSaveAfterCreate: boolean;
  onPendingSaveHandled: () => void;
};

export function RoadmapCanvas(props: RoadmapCanvasProps) {
  return (
    <ReactFlowProvider>
      <div className="roadmap-canvas relative">
        <RoadmapFlow {...props} />
      </div>
    </ReactFlowProvider>
  );
}
