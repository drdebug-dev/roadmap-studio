import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import type { LocalStepResource, ResourceType } from '@/types/roadmap'

const RESOURCE_TYPES: ResourceType[] = [
  'official',
  'article',
  'book',
  'video',
  'course',
  'roadmap',
]

type ResourceEditorListProps = {
  resources: LocalStepResource[]
  onChange: (resources: LocalStepResource[]) => void
}

function createEmptyResource(order: number): LocalStepResource {
  return {
    localId: crypto.randomUUID(),
    title: '',
    description: '',
    url: '',
    resource_type: 'article',
    is_free: true,
    order,
  }
}

export function ResourceEditorList({
  resources,
  onChange,
}: ResourceEditorListProps) {
  const updateResource = (
    localId: string,
    patch: Partial<LocalStepResource>,
  ) => {
    onChange(
      resources.map((resource) =>
        resource.localId === localId ? { ...resource, ...patch } : resource,
      ),
    )
  }

  const removeResource = (localId: string) => {
    onChange(
      resources
        .filter((resource) => resource.localId !== localId)
        .map((resource, index) => ({ ...resource, order: index })),
    )
  }

  const addResource = () => {
    onChange([...resources, createEmptyResource(resources.length)])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Resources</Label>
        <Button type="button" variant="outline" size="sm" onClick={addResource}>
          <Plus className="h-4 w-4" />
          Add resource
        </Button>
      </div>

      {resources.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No resources yet. Add one to link helpful material for this step.
        </p>
      ) : (
        <ScrollArea className="max-h-[420px] pr-3">
          <div className="space-y-4">
            {resources.map((resource, index) => (
              <div
                key={resource.localId}
                className="space-y-3 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    Resource {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    title="Remove resource"
                    onClick={() => removeResource(resource.localId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`resource-title-${resource.localId}`}>
                    Title
                  </Label>
                  <Input
                    id={`resource-title-${resource.localId}`}
                    value={resource.title}
                    onChange={(event) =>
                      updateResource(resource.localId, {
                        title: event.target.value,
                      })
                    }
                    placeholder="Resource title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`resource-description-${resource.localId}`}>
                    Description
                  </Label>
                  <Input
                    id={`resource-description-${resource.localId}`}
                    value={resource.description}
                    onChange={(event) =>
                      updateResource(resource.localId, {
                        description: event.target.value,
                      })
                    }
                    placeholder="Short description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`resource-url-${resource.localId}`}>URL</Label>
                  <Input
                    id={`resource-url-${resource.localId}`}
                    value={resource.url}
                    onChange={(event) =>
                      updateResource(resource.localId, {
                        url: event.target.value,
                      })
                    }
                    placeholder="https://example.com"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={resource.resource_type}
                      onValueChange={(value) =>
                        updateResource(resource.localId, {
                          resource_type: value as ResourceType,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {RESOURCE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                    <Label htmlFor={`resource-free-${resource.localId}`}>
                      Free
                    </Label>
                    <Switch
                      id={`resource-free-${resource.localId}`}
                      checked={resource.is_free}
                      onCheckedChange={(checked) =>
                        updateResource(resource.localId, { is_free: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

export { createEmptyResource }
