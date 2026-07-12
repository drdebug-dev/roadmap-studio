import { ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react'
import { useState } from 'react'

import { RoadmapFormDialog } from '@/components/dialogs/RoadmapFormDialog'
import { RoadmapListCard } from '@/components/panels/RoadmapListCard'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRoadmapEditorContext } from '@/contexts/RoadmapEditorContext'
import { useRoadmaps } from '@/hooks/useRoadmaps'

type DialogState =
  | { mode: 'create' }
  | { mode: 'edit'; slug: string }
  | null

export function RoadmapsPanel() {
  const [collapsed, setCollapsed] = useState(false)
  const [dialogState, setDialogState] = useState<DialogState>(null)
  const { selectedSlug, navigateToRoadmap } = useRoadmapEditorContext()
  const { data, isLoading, isError, error } = useRoadmaps()
  const roadmaps = data?.results ?? []

  const handleDialogSuccess = (roadmap: { slug: string }) => {
    navigateToRoadmap(roadmap.slug)
    setDialogState(null)
  }

  if (collapsed) {
    return (
      <div className="absolute left-4 top-4 z-10">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="bg-background shadow-md"
          onClick={() => setCollapsed(false)}
          title="Show roadmaps"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <Card className="absolute left-4 top-4 z-10 flex w-[280px] flex-col shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">Roadmaps</CardTitle>
              <CardDescription>Select a roadmap to edit</CardDescription>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setDialogState({ mode: 'create' })}
                title="New roadmap"
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
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <ScrollArea className="h-[min(420px,calc(100vh-12rem))]">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : null}

            {isError ? (
              <p className="py-4 text-sm text-destructive">
                {(error as Error).message || 'Failed to load roadmaps'}
              </p>
            ) : null}

            {!isLoading && !isError && roadmaps.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                No roadmaps found.
              </p>
            ) : null}

            <ul className="space-y-2 pr-2">
              {roadmaps.map((roadmap) => (
                <RoadmapListCard
                  key={roadmap.id}
                  roadmap={roadmap}
                  isSelected={selectedSlug === roadmap.slug}
                  onSelect={() => navigateToRoadmap(roadmap.slug)}
                  onEdit={() =>
                    setDialogState({ mode: 'edit', slug: roadmap.slug })
                  }
                />
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>

      <RoadmapFormDialog
        mode={dialogState?.mode ?? 'create'}
        slug={dialogState?.mode === 'edit' ? dialogState.slug : null}
        open={dialogState !== null}
        onClose={() => setDialogState(null)}
        onSuccess={handleDialogSuccess}
      />
    </>
  )
}
