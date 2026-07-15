import { useCallback, useEffect, useRef } from 'react'

type UseIdleAutosaveOptions = {
  enabled: boolean
  delayMs?: number
  onIdle: () => void
}

export function useIdleAutosave({
  enabled,
  delayMs = 10_000,
  onIdle,
}: UseIdleAutosaveOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onIdleRef = useRef(onIdle)

  useEffect(() => {
    onIdleRef.current = onIdle
  }, [onIdle])

  const cancelTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resetTimer = useCallback(() => {
    cancelTimer()
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      onIdleRef.current()
    }, delayMs)
  }, [cancelTimer, delayMs])

  useEffect(() => {
    if (!enabled) {
      cancelTimer()
      return
    }

    resetTimer()
    return cancelTimer
  }, [cancelTimer, enabled, resetTimer])

  return { resetTimer, cancelTimer }
}
