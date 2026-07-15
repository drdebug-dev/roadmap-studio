import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";

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
import { useIdleAutosave } from "@/hooks/useIdleAutosave";
import { useRoadmapEditor } from "@/hooks/useRoadmapEditor";
import { useDeleteStep } from "@/hooks/useStep";
import { useSaveRoadmapSteps } from "@/hooks/useSaveRoadmapSteps";
import { hasPendingSaveChanges } from "@/lib/flow/mapRoadmapToFlow";
import { getApiErrorMessage, toast } from "@/lib/toast";
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
  const saveSteps = useSaveRoadmapSteps();
  const deleteStep = useDeleteStep({ silent: true });
  const pendingSaveInFlightRef = useRef(false);
  const handleSaveRef = useRef<() => Promise<void>>(async () => {});

  const { resetTimer, cancelTimer } = useIdleAutosave({
    enabled: Boolean(selectedSlug) && isDirty && !saveSteps.isPending,
    onIdle: () => {
      void handleSaveRef.current();
    },
  });

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
  } = useRoadmapEditor({ onDirty, onNodeActivity: resetTimer });

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

    try {
      await saveSteps.mutateAsync({
        slug: selectedSlug,
        state: { nodes, edges },
        baseline,
      });
      onClearDirty();
      onSaveSuccess();
    } catch {
      // Global mutation toast handles API errors.
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
    handleSaveRef.current = handleSave;
  }, [handleSave]);

  useEffect(() => {
    if (!isDirty) {
      cancelTimer();
    }
  }, [cancelTimer, isDirty]);

  useEffect(() => {
    if (!stateKey || !flowState || isDirty) {
      return;
    }

    loadState(flowState, stateKey);
  }, [flowState, isDirty, loadState, stateKey]);

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

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    const { nodeId, stepKind } = deleteTarget;
    const subNodes =
      stepKind === "main"
        ? nodes.filter(
            (node) =>
              node.data.stepKind === "sub" &&
              node.data.parentNodeId === nodeId,
          )
        : [];
    const mainNode = nodes.find((node) => node.id === nodeId);

    if (!mainNode) {
      cancelDeleteNode();
      return;
    }

    const nodesToDelete = [...subNodes, mainNode];
    const stepIdsToDelete = nodesToDelete
      .map((node) => node.data.stepId)
      .filter((id): id is number => id !== undefined);

    try {
      if (stepIdsToDelete.length > 0 && selectedSlug) {
        for (const stepId of stepIdsToDelete) {
          await deleteStep.mutateAsync({ slug: selectedSlug, id: stepId });
        }
      }

      const removedIds = new Set([nodeId, ...subNodes.map((node) => node.id)]);
      if (editTarget && removedIds.has(editTarget.nodeId)) {
        cancelEditStep();
      }

      confirmDeleteNode();

      if (stepIdsToDelete.length > 0) {
        toast.success(
          stepIdsToDelete.length > 1
            ? "Steps deleted successfully"
            : "Step deleted successfully",
        );
        onSaveSuccess();
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }, [
    cancelDeleteNode,
    cancelEditStep,
    confirmDeleteNode,
    deleteStep,
    deleteTarget,
    editTarget,
    nodes,
    onSaveSuccess,
    selectedSlug,
  ]);

  const handleCancelDelete = useCallback(() => {
    cancelDeleteNode();
  }, [cancelDeleteNode]);

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
        open={Boolean(deleteTarget)}
        title={
          deleteTarget?.stepKind === "main" ? "Delete main step" : "Delete sub step"
        }
        description={
          deleteTarget?.stepKind === "main" &&
          (deleteTarget.cascadeCount ?? 0) > 0
            ? `Are you sure you want to delete "${deleteTarget.label}"? ${deleteTarget.cascadeCount} related sub step(s) will also be removed.`
            : deleteTarget
              ? `Are you sure you want to delete "${deleteTarget.label}"? This action cannot be undone.`
              : ""
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isPending={deleteStep.isPending}
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
