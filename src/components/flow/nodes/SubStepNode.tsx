import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRoadmapEditorContext } from '@/contexts/RoadmapEditorContext'
import type { RoadmapNode } from '@/types/roadmap'

export function SubStepNode({ id, data, selected }: NodeProps<RoadmapNode>) {
  const { requestDeleteNode, requestEditStep } = useRoadmapEditorContext()

  return (
    <div
      className={`min-w-[140px] rounded-lg border border-dashed bg-card/90 px-3 py-2 shadow-sm transition-shadow ${
        selected
          ? 'border-[var(--accent)] shadow-[var(--shadow)]'
          : 'border-border'
      }`}
    >
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border !border-muted-foreground !bg-background"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border !border-muted-foreground !bg-background"
      />

      <div className="mb-1 flex items-center justify-between gap-2">
        <Badge variant="outline" className="text-[10px]">
          Sub step
        </Badge>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Edit"
            onClick={(event) => {
              event.stopPropagation()
              requestEditStep(id)
            }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            title="Delete"
            onClick={() => requestDeleteNode(id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="text-sm font-medium text-foreground">{data.label}</div>
    </div>
  )
}
