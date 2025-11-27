import { useEffect, useMemo, useState } from 'react'

const UpdateLoader = () => {
  const [progress, setProgress] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!window.electronAPI?.onUpdateProgress) {
      return
    }

    const unsubscribe = window.electronAPI.onUpdateProgress((percent) => {
      setProgress(percent)
      setIsComplete(percent >= 100)
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  const shouldShow = progress !== null
  const clampedProgress = useMemo(() => {
    if (progress === null) return 0
    return Math.max(0, Math.min(100, progress))
  }, [progress])

  if (!shouldShow) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border bg-card/95 p-4 shadow-2xl backdrop-blur">
      <p className="text-sm font-medium text-muted-foreground">
        Update in progress
      </p>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl font-semibold text-primary">
          {clampedProgress.toFixed(0)}%
        </span>
        <span className="text-xs text-muted-foreground">
          {isComplete ? 'Installing…' : 'Downloading new version'}
        </span>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Please keep the app open while we update you to the latest release.
      </p>
    </div>
  )
}

export default UpdateLoader
