import { FaqEmptyState } from '@/components/panels/faqs/FaqEmptyState'
import { FaqListItem } from '@/components/panels/faqs/FaqListItem'
import type { Faq } from '@/types/faq'

type FaqListProps = {
  faqs: Faq[]
  onEdit: (faq: Faq) => void
  onDelete: (faq: Faq) => void
}

export function FaqList({ faqs, onEdit, onDelete }: FaqListProps) {
  if (faqs.length === 0) {
    return <FaqEmptyState />
  }

  return (
    <ul className="space-y-2 pr-2">
      {faqs.map((faq) => (
        <FaqListItem
          key={faq.id}
          faq={faq}
          onEdit={() => onEdit(faq)}
          onDelete={() => onDelete(faq)}
        />
      ))}
    </ul>
  )
}
