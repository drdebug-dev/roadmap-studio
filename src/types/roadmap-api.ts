import type { Category } from './category.ts'

export type RoadmapStatus = 'draft' | 'published'

export type RoadmapStep = {
  id: number
  title: string
  priority: string
  order: number
  position_x: number
  position_y: number
  children: RoadmapStep[]
}

export type RoadmapConnection = {
  id: number
  from_step: number
  to_step: number
}

export type RelatedRoadmap = {
  id: number
  title: string
  slug: string
  icon: string | null
}

export type RoadmapListItem = {
  id: number
  title: string
  slug: string
  description: string
  icon: string | null
  cover_image: string | null
  status: RoadmapStatus
  category: Category
}

export type RoadmapDetail = RoadmapListItem & {
  steps: RoadmapStep[]
  connections: RoadmapConnection[]
  related_roadmaps: RelatedRoadmap[]
  created_at: string
  updated_at: string
}

export type RoadmapWritePayload = {
  title: string
  slug: string
  description: string
  status: RoadmapStatus
  category: number
  related_roadmaps: number[]
  icon?: File | null
  cover_image?: File | null
  clear_icon?: boolean
  clear_cover_image?: boolean
}

export type CreateRoadmapInput = RoadmapWritePayload

export type UpdateRoadmapInput = RoadmapWritePayload
