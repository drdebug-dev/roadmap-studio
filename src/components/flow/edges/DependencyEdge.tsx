import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'

import type { RoadmapEdge } from '@/types/roadmap'

export function DependencyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps<RoadmapEdge>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        stroke: 'var(--text)',
        strokeWidth: 1.5,
        strokeDasharray: '6 4',
        opacity: 0.7,
      }}
    />
  )
}
