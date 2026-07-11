export type Faq = {
  id: number
  question: string
  answer: string
  order: number
}

export type CreateFaqInput = {
  question: string
  answer: string
}

export type UpdateFaqInput = Partial<CreateFaqInput>

export type FaqDetail = Faq & {
  created_at: string
  updated_at: string
}

export type FaqsListParams = {
  ordering?: string
  page?: number
  search?: string
}
