import type { PaginatedResponse } from '../../types/api.ts'
import type {
  CreateQuizInput,
  CreateQuizQuestionInput,
  Quiz,
  QuizDetail,
  QuizQuestion,
  QuizzesListParams,
  UpdateQuizInput,
  UpdateQuizQuestionInput,
} from '../../types/quiz.ts'
import { apiClient } from './client.ts'

export const quizzesApi = {
  list: async (slug: string, params?: QuizzesListParams) => {
    const { data } = await apiClient.get<PaginatedResponse<Quiz>>(
      `/roadmaps/${slug}/quizzes/`,
      { params },
    )
    return data
  },

  detail: async (slug: string, id: number) => {
    const { data } = await apiClient.get<QuizDetail>(
      `/roadmaps/${slug}/quizzes/${id}/`,
    )
    return data
  },

  create: async (slug: string, input: CreateQuizInput) => {
    const { data } = await apiClient.post<Quiz>(
      `/roadmaps/${slug}/quizzes/`,
      input,
    )
    return data
  },

  update: async (slug: string, id: number, input: UpdateQuizInput) => {
    const { data } = await apiClient.patch<Quiz>(
      `/roadmaps/${slug}/quizzes/${id}/`,
      input,
    )
    return data
  },

  delete: async (slug: string, id: number) => {
    await apiClient.delete(`/roadmaps/${slug}/quizzes/${id}/`)
  },

  createQuestion: async (
    slug: string,
    quizId: number,
    input: CreateQuizQuestionInput,
  ) => {
    const { data } = await apiClient.post<QuizQuestion>(
      `/roadmaps/${slug}/quizzes/${quizId}/questions/`,
      input,
    )
    return data
  },

  updateQuestion: async (
    slug: string,
    quizId: number,
    questionId: number,
    input: UpdateQuizQuestionInput,
  ) => {
    const { data } = await apiClient.patch<QuizQuestion>(
      `/roadmaps/${slug}/quizzes/${quizId}/questions/${questionId}/`,
      input,
    )
    return data
  },

  deleteQuestion: async (
    slug: string,
    quizId: number,
    questionId: number,
  ) => {
    await apiClient.delete(
      `/roadmaps/${slug}/quizzes/${quizId}/questions/${questionId}/`,
    )
  },
}
