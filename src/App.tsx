import { useMemo, useState } from 'react'

import { RoadmapCanvas } from '@/components/flow/RoadmapCanvas'
import { Navbar } from '@/components/layout/Navbar'
import { useRoadmap } from '@/hooks/useRoadmaps'
import { mapRoadmapToFlow } from '@/lib/flow/mapRoadmapToFlow'

function RoadmapStudio() {
  const [selectedSlug, setSelectedSlugState] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const { data: roadmapDetail } = useRoadmap(selectedSlug ?? '')

  const setSelectedSlug = (slug: string) => {
    setSelectedSlugState(slug)
    setIsDirty(false)
  }

  const flowState = useMemo(() => {
    if (!roadmapDetail) {
      return null
    }

    return mapRoadmapToFlow(roadmapDetail)
  }, [roadmapDetail])

  return (
    <>
      <Navbar roadmapTitle={roadmapDetail?.title} isDirty={isDirty} />
      <RoadmapCanvas
        selectedSlug={selectedSlug}
        setSelectedSlug={setSelectedSlug}
        roadmapTitle={roadmapDetail?.title ?? null}
        flowState={flowState}
        stateKey={roadmapDetail ? selectedSlug : null}
        isDirty={isDirty}
        onDirty={() => setIsDirty(true)}
      />
    </>
  )
}

function App() {
  return (
    <div className="app">
      <RoadmapStudio />
    </div>
  )
}

export default App
