import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { quizKeys } from '../lib/api/queryKeys.ts'
import { quizzesApi } from '../lib/api/quizzes.ts'
import type {
  CreateQuizInput,
  CreateQuizQuestionInput,
  QuizzesListParams,
  UpdateQuizInput,
  UpdateQuizQuestionInput,
} from '../types/quiz.ts'

export function useQuizzes(slug: string, params?: QuizzesListParams) {
  return useQuery({
    queryKey: quizKeys.list(slug, params),
    queryFn: () => quizzesApi.list(slug, params),
    enabled: Boolean(slug) && (params?.step === undefined || params.step > 0),
  })
}

export function useQuiz(slug: string, quizId: number) {
  return useQuery({
    queryKey: quizKeys.detail(slug, quizId),
    queryFn: () => quizzesApi.detail(slug, quizId),
    enabled: Boolean(slug) && quizId > 0,
  })
}

export function useCreateQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['quizzes', 'create'],
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

export function useUpdateQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['quizzes', 'update'],
    mutationFn: ({
      slug,
      id,
      input,
    }: {
      slug: string
      id: number
      input: UpdateQuizInput
    }) => quizzesApi.update(slug, id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.detail(variables.slug, variables.id),
      })
      queryClient.invalidateQueries({
        queryKey: quizKeys.list(variables.slug),
      })
    },
  })
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['quizzes', 'delete'],
    mutationFn: ({ slug, id }: { slug: string; id: number }) =>
      quizzesApi.delete(slug, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.list(variables.slug),
      })
      queryClient.removeQueries({
        queryKey: quizKeys.detail(variables.slug, variables.id),
      })
    },
  })
}

export function useCreateQuizQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['quiz-questions', 'create'],
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

export function useUpdateQuizQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['quiz-questions', 'update'],
    mutationFn: ({
      slug,
      quizId,
      questionId,
      input,
    }: {
      slug: string
      quizId: number
      questionId: number
      input: UpdateQuizQuestionInput
    }) => quizzesApi.updateQuestion(slug, quizId, questionId, input),
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

export function useDeleteQuizQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['quiz-questions', 'delete'],
    mutationFn: ({
      slug,
      quizId,
      questionId,
    }: {
      slug: string
      quizId: number
      questionId: number
    }) => quizzesApi.deleteQuestion(slug, quizId, questionId),
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
