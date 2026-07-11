import { ImageIcon, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from '@/components/ui/attachment'
import { Label } from '@/components/ui/label'
import { formatFileSize, getMediaUrl } from '@/lib/utils/media'

type ImageAttachmentFieldProps = {
  label: string
  accept?: string
  file: File | null
  existingPath: string | null
  onFileChange: (file: File | null) => void
  onClear: () => void
}

function getFileName(path: string) {
  return path.split('/').pop() ?? path
}

export function ImageAttachmentField({
  label,
  accept = 'image/*',
  file,
  existingPath,
  onFileChange,
  onClear,
}: ImageAttachmentFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  const existingUrl = getMediaUrl(existingPath)
  const displayUrl = previewUrl ?? existingUrl
  const hasAttachment = Boolean(file || existingPath)

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) {
      return
    }

    onFileChange(selectedFile)
  }

  if (!hasAttachment) {
    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>{label}</Label>
        <Attachment state="idle" className="w-full">
          <AttachmentMedia variant="icon">
            <ImageIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>Choose {label.toLowerCase()}</AttachmentTitle>
            <AttachmentDescription>Click to upload an image</AttachmentDescription>
          </AttachmentContent>
          <AttachmentTrigger
            type="button"
            aria-label={`Upload ${label.toLowerCase()}`}
            onClick={() => inputRef.current?.click()}
          />
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(event) => {
              handleFileSelect(event.target.files?.[0] ?? null)
              event.target.value = ''
            }}
          />
        </Attachment>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Attachment state="done" className="w-full">
        <AttachmentMedia variant="image">
          {displayUrl ? (
            <img src={displayUrl} alt={file?.name ?? label} />
          ) : (
            <ImageIcon />
          )}
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>
            {file?.name ?? (existingPath ? getFileName(existingPath) : label)}
          </AttachmentTitle>
          <AttachmentDescription>
            {file
              ? formatFileSize(file.size)
              : existingPath
                ? 'Current image'
                : 'Image attached'}
          </AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction
            type="button"
            aria-label={`Remove ${label.toLowerCase()}`}
            onClick={onClear}
          >
            <X />
          </AttachmentAction>
        </AttachmentActions>
        <AttachmentTrigger
          type="button"
          aria-label={`Replace ${label.toLowerCase()}`}
          onClick={() => inputRef.current?.click()}
        />
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            handleFileSelect(event.target.files?.[0] ?? null)
            event.target.value = ''
          }}
        />
      </Attachment>
    </div>
  )
}
