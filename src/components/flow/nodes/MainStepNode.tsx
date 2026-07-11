import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRoadmapEditorContext } from '@/contexts/RoadmapEditorContext'
import type { RoadmapNode } from '@/types/roadmap'

export function MainStepNode({ id, data, selected }: NodeProps<RoadmapNode>) {
  const { requestDeleteNode, addSubStep, requestEditStep } =
    useRoadmapEditorContext()

  return (
    <div
      className={`min-w-[180px] rounded-xl border-2 bg-card px-4 py-3 shadow-md transition-shadow ${
        selected
          ? 'border-[var(--accent)] shadow-[var(--shadow)]'
          : 'border-border'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-[var(--accent)] !bg-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-[var(--accent)] !bg-background"
      />

      <div className="mb-2 flex items-center justify-between gap-2">
        <Badge variant="secondary" className="text-[10px]">
          Main step
        </Badge>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Edit"
            onClick={(event) => {
              event.stopPropagation()
              requestEditStep(id)
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Add sub step"
            onClick={() => addSubStep(id)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            title="Delete"
            onClick={() => requestDeleteNode(id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="font-semibold text-foreground">{data.label}</div>
      {data.priority ? (
        <div className="mt-1 text-xs text-muted-foreground">
          Priority: {data.priority}
        </div>
      ) : null}
    </div>
  )
}
