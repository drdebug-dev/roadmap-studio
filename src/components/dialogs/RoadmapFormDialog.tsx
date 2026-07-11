import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ImageAttachmentField } from '@/components/ui/image-attachment-field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategories } from '@/hooks/useCategories'
import {
  useCreateRoadmap,
  useRoadmap,
  useRoadmaps,
  useUpdateRoadmap,
} from '@/hooks/useRoadmaps'
import { slugify } from '@/lib/utils/slugify'
import type { RoadmapStatus } from '@/types/roadmap-api'

const STATUSES: RoadmapStatus[] = ['draft', 'published']

type RoadmapFormState = {
  title: string
  slug: string
  description: string
  iconFile: File | null
  coverFile: File | null
  iconExisting: string | null
  coverExisting: string | null
  iconCleared: boolean
  coverCleared: boolean
  status: RoadmapStatus
  category: string
  related_roadmaps: number[]
}

const EMPTY_FORM: RoadmapFormState = {
  title: '',
  slug: '',
  description: '',
  iconFile: null,
  coverFile: null,
  iconExisting: null,
  coverExisting: null,
  iconCleared: false,
  coverCleared: false,
  status: 'draft',
  category: '',
  related_roadmaps: [],
}

type RoadmapFormDialogProps = {
  mode: 'create' | 'edit'
  slug: string | null
  open: boolean
  onClose: () => void
  onSuccess: (roadmap: { slug: string }) => void
}

function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === 'string') {
      return data
    }
    if (data && typeof data === 'object') {
      const messages = Object.entries(data).flatMap(([field, value]) => {
        if (Array.isArray(value)) {
          return value.map((message) => `${field}: ${String(message)}`)
        }
        return [`${field}: ${String(value)}`]
      })
      if (messages.length > 0) {
        return messages.join(' ')
      }
    }
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong.'
}

export function RoadmapFormDialog({
  mode,
  slug,
  open,
  onClose,
  onSuccess,
}: RoadmapFormDialogProps) {
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories()
  const { data: roadmapsData } = useRoadmaps()
  const { data: roadmapDetail, isLoading: isDetailLoading } = useRoadmap(
    mode === 'edit' && slug ? slug : '',
  )
  const createRoadmap = useCreateRoadmap()
  const updateRoadmap = useUpdateRoadmap()

  const [formState, setFormState] = useState<RoadmapFormState>(EMPTY_FORM)
  const [slugTouched, setSlugTouched] = useState(false)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [slugError, setSlugError] = useState<string | null>(null)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const categories = categoriesData?.results ?? []
  const roadmaps = roadmapsData?.results ?? []
  const relatedRoadmapOptions = roadmaps.filter(
    (roadmap) => roadmap.slug !== slug,
  )

  const isLoading =
    mode === 'edit' && (isDetailLoading || !roadmapDetail || isCategoriesLoading)
  const isSubmitting = createRoadmap.isPending || updateRoadmap.isPending

  useEffect(() => {
    if (!open) {
      return
    }

    setTitleError(null)
    setSlugError(null)
    setCategoryError(null)
    setSubmitError(null)

    if (mode === 'create') {
      setFormState(EMPTY_FORM)
      setSlugTouched(false)
      return
    }

    if (!roadmapDetail) {
      return
    }

    setFormState({
      title: roadmapDetail.title,
      slug: roadmapDetail.slug,
      description: roadmapDetail.description,
      iconFile: null,
      coverFile: null,
      iconExisting: roadmapDetail.icon,
      coverExisting: roadmapDetail.cover_image,
      iconCleared: false,
      coverCleared: false,
      status: roadmapDetail.status,
      category: String(roadmapDetail.category.id),
      related_roadmaps: roadmapDetail.related_roadmaps.map(
        (roadmap) => roadmap.id,
      ),
    })
    setSlugTouched(true)
  }, [mode, open, roadmapDetail])

  const handleTitleChange = (title: string) => {
    setTitleError(null)
    setFormState((current) => ({
      ...current,
      title,
      slug:
        mode === 'create' && !slugTouched ? slugify(title) : current.slug,
    }))
  }

  const handleSlugChange = (slugValue: string) => {
    setSlugTouched(true)
    setSlugError(null)
    setFormState((current) => ({ ...current, slug: slugValue }))
  }

  const toggleRelatedRoadmap = (roadmapId: number) => {
    setFormState((current) => {
      const isSelected = current.related_roadmaps.includes(roadmapId)
      return {
        ...current,
        related_roadmaps: isSelected
          ? current.related_roadmaps.filter((id) => id !== roadmapId)
          : [...current.related_roadmaps, roadmapId],
      }
    })
  }

  const handleSubmit = async () => {
    const trimmedTitle = formState.title.trim()
    const trimmedSlug = formState.slug.trim()

    let hasError = false

    if (!trimmedTitle) {
      setTitleError('Title is required.')
      hasError = true
    }

    if (!trimmedSlug) {
      setSlugError('Slug is required.')
      hasError = true
    }

    if (!formState.category) {
      setCategoryError('Category is required.')
      hasError = true
    }

    if (hasError) {
      return
    }

    setSubmitError(null)

    const payload = {
      title: trimmedTitle,
      slug: trimmedSlug,
      description: formState.description,
      status: formState.status,
      category: Number(formState.category),
      related_roadmaps: formState.related_roadmaps,
      icon: formState.iconFile,
      cover_image: formState.coverFile,
      clear_icon: formState.iconCleared,
      clear_cover_image: formState.coverCleared,
    }

    try {
      if (mode === 'create') {
        const created = await createRoadmap.mutateAsync(payload)
        onSuccess({ slug: created.slug })
      } else if (slug) {
        const updated = await updateRoadmap.mutateAsync({
          slug,
          input: payload,
        })
        onSuccess({ slug: updated.slug })
      }
      onClose()
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'New roadmap' : 'Edit roadmap'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new roadmap with metadata and relations.'
              : 'Update roadmap metadata, status, category, and related roadmaps.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-8">
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-24 animate-pulse rounded-md bg-muted" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="roadmap-title">Title</Label>
                <Input
                  id="roadmap-title"
                  value={formState.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  placeholder="Frontend Developer"
                  aria-invalid={Boolean(titleError)}
                />
                {titleError ? (
                  <p className="text-sm text-destructive">{titleError}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roadmap-slug">Slug</Label>
                <Input
                  id="roadmap-slug"
                  value={formState.slug}
                  onChange={(event) => handleSlugChange(event.target.value)}
                  placeholder="frontend-developer"
                  aria-invalid={Boolean(slugError)}
                />
                {slugError ? (
                  <p className="text-sm text-destructive">{slugError}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roadmap-description">Description</Label>
              <textarea
                id="roadmap-description"
                value={formState.description}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="A short summary of this roadmap"
                rows={3}
                className="w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value) =>
                    setFormState((current) => ({
                      ...current,
                      status: value as RoadmapStatus,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formState.category}
                  onValueChange={(value) => {
                    setCategoryError(null)
                    setFormState((current) => ({ ...current, category: value }))
                  }}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={Boolean(categoryError)}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categoryError ? (
                  <p className="text-sm text-destructive">{categoryError}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ImageAttachmentField
                label="Icon"
                file={formState.iconFile}
                existingPath={
                  formState.iconCleared ? null : formState.iconExisting
                }
                onFileChange={(file) =>
                  setFormState((current) => ({
                    ...current,
                    iconFile: file,
                    iconCleared: false,
                  }))
                }
                onClear={() =>
                  setFormState((current) => ({
                    ...current,
                    iconFile: null,
                    iconExisting: null,
                    iconCleared: true,
                  }))
                }
              />

              <ImageAttachmentField
                label="Cover image"
                file={formState.coverFile}
                existingPath={
                  formState.coverCleared ? null : formState.coverExisting
                }
                onFileChange={(file) =>
                  setFormState((current) => ({
                    ...current,
                    coverFile: file,
                    coverCleared: false,
                  }))
                }
                onClear={() =>
                  setFormState((current) => ({
                    ...current,
                    coverFile: null,
                    coverExisting: null,
                    coverCleared: true,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Related roadmaps</Label>
              <ScrollArea className="h-32 rounded-md border p-3">
                {relatedRoadmapOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No other roadmaps available.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {relatedRoadmapOptions.map((roadmap) => {
                      const checked = formState.related_roadmaps.includes(
                        roadmap.id,
                      )

                      return (
                        <li key={roadmap.id}>
                          <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-input"
                              checked={checked}
                              onChange={() => toggleRelatedRoadmap(roadmap.id)}
                            />
                            <span>{roadmap.title}</span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </ScrollArea>
            </div>

            {submitError ? (
              <p className="text-sm text-destructive">{submitError}</p>
            ) : null}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || isSubmitting}
          >
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
