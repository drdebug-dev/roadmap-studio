import { ChevronLeft, ChevronRight, Loader2, Plus, Search } from 'lucide-react'
import { useState } from 'react'

import { FaqFormDialog } from '@/components/dialogs/FaqFormDialog'
import { FaqList } from '@/components/panels/faqs/FaqList'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRoadmapEditorContext } from '@/contexts/RoadmapEditorContext'
import { useDeleteFaq, useFaqs } from '@/hooks/useFaqs'
import type { Faq } from '@/types/faq'

type FormDialogState =
  | { mode: 'create' }
  | { mode: 'edit'; faq: Faq }
  | null

export function RoadmapFaqsPanel() {
  const { selectedSlug } = useRoadmapEditorContext()
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')
  const [formDialogState, setFormDialogState] = useState<FormDialogState>(null)
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null)

  const listParams = search.trim() ? { search: search.trim() } : undefined
  const { data, isLoading, isError, error } = useFaqs(
    selectedSlug ?? '',
    listParams,
  )
  const deleteFaq = useDeleteFaq()

  const faqs = data?.results ?? []

  if (!selectedSlug) {
    return null
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return
    }

    try {
      await deleteFaq.mutateAsync({
        slug: selectedSlug,
        id: deleteTarget.id,
      })
      setDeleteTarget(null)
    } catch {
      // Error surfaced via mutation state if needed; keep dialog open
    }
  }

  if (collapsed) {
    return (
      <div className="absolute right-4 top-[5.5rem] z-10 nodrag nopan">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="bg-background shadow-md"
          onClick={() => setCollapsed(false)}
          title="Show FAQs"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <Card className="absolute right-4 top-[5.5rem] z-10 flex w-[300px] flex-col shadow-lg nodrag nopan">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">FAQs</CardTitle>
              <CardDescription>
                Manage questions for this roadmap
              </CardDescription>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setFormDialogState({ mode: 'create' })}
                title="Add FAQ"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCollapsed(true)}
                title="Close panel"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pb-4 pt-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search FAQs..."
              className="h-8 pl-8 text-sm"
            />
          </div>

          <ScrollArea className="h-[min(380px,calc(100vh-16rem))]">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : null}

            {isError ? (
              <p className="py-4 text-sm text-destructive">
                {(error as Error).message || 'Failed to load FAQs'}
              </p>
            ) : null}

            {!isLoading && !isError ? (
              <FaqList
                faqs={faqs}
                onEdit={(faq) => setFormDialogState({ mode: 'edit', faq })}
                onDelete={setDeleteTarget}
              />
            ) : null}
          </ScrollArea>
        </CardContent>
      </Card>

      <FaqFormDialog
        mode={formDialogState?.mode ?? 'create'}
        slug={selectedSlug}
        faq={formDialogState?.mode === 'edit' ? formDialogState.faq : null}
        open={formDialogState !== null}
        onClose={() => setFormDialogState(null)}
        onSuccess={() => setFormDialogState(null)}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete FAQ</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.question}
              &rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteFaq.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
