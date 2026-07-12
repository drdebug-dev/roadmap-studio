import { createContext, useContext, type ReactNode } from 'react'

import type { useRoadmapEditor } from '@/hooks/useRoadmapEditor'

type RoadmapEditorContextValue = ReturnType<typeof useRoadmapEditor> & {
  selectedSlug: string | null
  navigateToRoadmap: (slug: string) => void
  roadmapTitle: string | null
  isDirty: boolean
}

const RoadmapEditorContext = createContext<RoadmapEditorContextValue | null>(
  null,
)

export function RoadmapEditorProvider({
  value,
  children,
}: {
  value: RoadmapEditorContextValue
  children: ReactNode
}) {
  return (
    <RoadmapEditorContext.Provider value={value}>
      {children}
    </RoadmapEditorContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRoadmapEditorContext() {
  const context = useContext(RoadmapEditorContext)

  if (!context) {
    throw new Error(
      'useRoadmapEditorContext must be used within RoadmapEditorProvider',
    )
  }

  return context
}
