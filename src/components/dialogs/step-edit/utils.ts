import type { LocalStepResource, ResourceType } from '@/types/roadmap'
import type { StepResource } from '@/types/step'

export const RESOURCE_TYPES: ResourceType[] = [
  'official',
  'article',
  'book',
  'video',
  'course',
  'roadmap',
]

export function createEmptyResource(order: number): LocalStepResource {
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

export function mapApiResources(resources: StepResource[]): LocalStepResource[] {
  return resources.map((resource) => ({
    localId: crypto.randomUUID(),
    id: resource.id,
    title: resource.title,
    description: resource.description,
    url: resource.url,
    resource_type: resource.resource_type,
    is_free: resource.is_free,
    order: resource.order,
  }))
}

export function isValidUrl(value: string) {
  if (!value.trim()) {
    return true
  }

  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}
