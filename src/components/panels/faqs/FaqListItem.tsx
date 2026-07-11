import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Faq } from '@/types/faq'

type FaqListItemProps = {
  faq: Faq
  onEdit: () => void
  onDelete: () => void
}

export function FaqListItem({ faq, onEdit, onDelete }: FaqListItemProps) {
  return (
    <li className="rounded-lg border bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 flex-1 text-sm font-medium text-foreground">
          {faq.question}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Edit FAQ"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            title="Delete FAQ"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </li>
  )
}
