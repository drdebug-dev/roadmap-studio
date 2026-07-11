import { Pencil } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { RoadmapListItem } from '@/types/roadmap-api'

type RoadmapListCardProps = {
  roadmap: RoadmapListItem
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
}

export function RoadmapListCard({
  roadmap,
  isSelected,
  onSelect,
  onEdit,
}: RoadmapListCardProps) {
  return (
    <li className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute left-1 top-1 z-10 h-7 w-7"
        title="Edit roadmap"
        onClick={(event) => {
          event.stopPropagation()
          onEdit()
        }}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>

      <button
        type="button"
        className={`w-full rounded-lg border p-3 pl-9 text-right transition-colors ${
          isSelected
            ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
            : 'border-border bg-background hover:bg-accent/50'
        }`}
        onClick={onSelect}
      >
        <div className="flex items-center justify-end gap-2">
          <span className="font-medium text-foreground">{roadmap.title}</span>
          {roadmap.status !== 'published' ? (
            <Badge variant="secondary" className="text-[10px] font-normal">
              {roadmap.status}
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {roadmap.description || 'No description'}
        </p>
      </button>
    </li>
  )
}
