export type Category = {
  id: number
  title: string
  slug: string
  description: string
  icon: string | null
  order: number
  created_at: string
  updated_at: string
}

export type CreateCategoryInput = {
  title: string
  slug: string
  description: string
  icon: string
  order: number
}
