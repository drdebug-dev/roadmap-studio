import { useCallback, useMemo, useRef, useState } from 'react'
import { Route, Routes, useNavigate, useParams } from 'react-router-dom'

import { RoadmapFormDialog } from '@/components/dialogs/RoadmapFormDialog'
import { RoadmapCanvas } from '@/components/flow/RoadmapCanvas'
import { useRoadmap } from '@/hooks/useRoadmaps'
import { mapRoadmapToFlow } from '@/lib/flow/mapRoadmapToFlow'

function RoadmapStudio() {
  const { slug: slugParam } = useParams()
  const navigate = useNavigate()
  const selectedSlug = slugParam ?? null

  const [isDirty, setIsDirty] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  const [saveRequiredDialogOpen, setSaveRequiredDialogOpen] = useState(false)
  const [pendingSaveAfterCreate, setPendingSaveAfterCreate] = useState(false)
  const pendingSaveRef = useRef(false)

  const { data: roadmapDetail } = useRoadmap(selectedSlug ?? '')

  const navigateToRoadmap = useCallback(
    (slug: string) => {
      if (
        isDirty &&
        selectedSlug &&
        selectedSlug !== slug &&
        !window.confirm('You have unsaved changes. Leave anyway?')
      ) {
        return
      }

      navigate(`/${slug}`)
      if (selectedSlug !== slug) {
        setIsDirty(false)
      }
    },
    [isDirty, navigate, selectedSlug],
  )

  const flowState = useMemo(() => {
    if (!roadmapDetail) {
      return null
    }

    return mapRoadmapToFlow(roadmapDetail)
  }, [roadmapDetail])

  const stateKey = selectedSlug ? `${selectedSlug}-${reloadToken}` : null

  const handleSaveWithoutSlug = useCallback(() => {
    pendingSaveRef.current = true
    setSaveRequiredDialogOpen(true)
  }, [])

  const handleSaveSuccess = useCallback(() => {
    setIsDirty(false)
    setReloadToken((current) => current + 1)
    pendingSaveRef.current = false
    setPendingSaveAfterCreate(false)
  }, [])

  const handleSaveRequiredDialogClose = useCallback(() => {
    setSaveRequiredDialogOpen(false)
    pendingSaveRef.current = false
    setPendingSaveAfterCreate(false)
  }, [])

  const handleSaveRequiredDialogSuccess = useCallback(
    (roadmap: { slug: string }) => {
      setSaveRequiredDialogOpen(false)
      navigate(`/${roadmap.slug}`)
      if (pendingSaveRef.current) {
        setPendingSaveAfterCreate(true)
      }
      pendingSaveRef.current = false
    },
    [navigate],
  )

  return (
    <>
      <RoadmapCanvas
        selectedSlug={selectedSlug}
        navigateToRoadmap={navigateToRoadmap}
        roadmapTitle={roadmapDetail?.title ?? null}
        flowState={flowState}
        stateKey={stateKey}
        isDirty={isDirty}
        onDirty={() => setIsDirty(true)}
        onClearDirty={() => setIsDirty(false)}
        onSaveWithoutSlug={handleSaveWithoutSlug}
        onSaveSuccess={handleSaveSuccess}
        pendingSaveAfterCreate={pendingSaveAfterCreate}
        onPendingSaveHandled={() => setPendingSaveAfterCreate(false)}
      />

      <RoadmapFormDialog
        mode="create"
        slug={null}
        open={saveRequiredDialogOpen}
        variant="requiredForSave"
        onClose={handleSaveRequiredDialogClose}
        onSuccess={handleSaveRequiredDialogSuccess}
      />
    </>
  )
}

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<RoadmapStudio />} />
        <Route path="/:slug" element={<RoadmapStudio />} />
      </Routes>
    </div>
  )
}

export default App
