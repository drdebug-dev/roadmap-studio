import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { faqsApi } from '../lib/api/faqs.ts'
import { faqKeys } from '../lib/api/queryKeys.ts'
import type {
  CreateFaqInput,
  FaqsListParams,
  UpdateFaqInput,
} from '../types/faq.ts'

export function useFaqs(slug: string, params?: FaqsListParams) {
  return useQuery({
    queryKey: faqKeys.list(slug, params),
    queryFn: () => faqsApi.list(slug, params),
    enabled: Boolean(slug),
  })
}

export function useCreateFaq() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['faqs', 'create'],
    mutationFn: ({
      slug,
      input,
    }: {
      slug: string
      input: CreateFaqInput
    }) => faqsApi.create(slug, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: faqKeys.list(variables.slug),
      })
    },
  })
}

export function useUpdateFaq() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['faqs', 'update'],
    mutationFn: ({
      slug,
      id,
      input,
    }: {
      slug: string
      id: number
      input: UpdateFaqInput
    }) => faqsApi.update(slug, id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: faqKeys.list(variables.slug),
      })
    },
  })
}

export function useDeleteFaq() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['faqs', 'delete'],
    mutationFn: ({ slug, id }: { slug: string; id: number }) =>
      faqsApi.delete(slug, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: faqKeys.list(variables.slug),
      })
    },
  })
}
