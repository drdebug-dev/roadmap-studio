import { useMutation, useQueryClient } from '@tanstack/react-query'
import { quizKeys } from '../lib/api/queryKeys.ts'
import { quizzesApi } from '../lib/api/quizzes.ts'
import type { CreateQuizInput, CreateQuizQuestionInput } from '../types/quiz.ts'

export function useCreateQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      slug,
      input,
    }: {
      slug: string
      input: CreateQuizInput
    }) => quizzesApi.create(slug, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.all })
      queryClient.invalidateQueries({
        queryKey: quizKeys.list(variables.slug),
      })
    },
  })
}

export function useCreateQuizQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      slug,
      quizId,
      input,
    }: {
      slug: string
      quizId: number
      input: CreateQuizQuestionInput
    }) => quizzesApi.createQuestion(slug, quizId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.detail(variables.slug, variables.quizId),
      })
      queryClient.invalidateQueries({
        queryKey: quizKeys.list(variables.slug),
      })
    },
  })
}
