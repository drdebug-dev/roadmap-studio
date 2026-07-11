import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '../lib/api/categories.ts'
import { categoryKeys } from '../lib/api/queryKeys.ts'
import type { ListParams } from '../types/api.ts'
import type { CreateCategoryInput } from '../types/category.ts'

export function useCategories(params?: ListParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoriesApi.list(params),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoriesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}
