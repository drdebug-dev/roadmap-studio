import { lazy, Suspense } from 'react'

import '@uiw/react-md-editor/markdown-editor.css'

const MDEditor = lazy(() => import('@uiw/react-md-editor'))

type MarkdownEditorFieldProps = {
  value: string
  onChange: (value: string) => void
}

export function MarkdownEditorField({
  value,
  onChange,
}: MarkdownEditorFieldProps) {
  return (
    <Suspense
      fallback={
        <div className="h-64 animate-pulse rounded-md bg-muted" aria-hidden />
      }
    >
      <div data-color-mode="light">
        <MDEditor
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? '')}
          height={320}
          preview="live"
        />
      </div>
    </Suspense>
  )
}
