import type { RelatedRoadmap } from './roadmap-api.ts'

export type StepPriority = 'required' | 'recommended' | 'optional'

export type ResourceType =
  | 'official'
  | 'article'
  | 'book'
  | 'video'
  | 'course'
  | 'roadmap'

export type StepResource = {
  id: number
  title: string
  description: string
  url: string
  resource_type: ResourceType
  is_free: boolean
  order: number
  linked_roadmap: RelatedRoadmap | null
}

export type StepChild = {
  id: number
  title: string
  priority: StepPriority
  order: number
  position_x: number
  position_y: number
  children: StepChild[]
}

export type StepDetail = {
  id: number
  roadmap: number
  parent: number | null
  title: string
  content: string
  priority: StepPriority
  order: number
  position_x: number
  position_y: number
  resources: StepResource[]
  children: StepChild[]
  created_at: string
  updated_at: string
}
