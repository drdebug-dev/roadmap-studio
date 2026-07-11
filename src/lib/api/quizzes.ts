import type {
  CreateQuizInput,
  CreateQuizQuestionInput,
  Quiz,
  QuizQuestion,
} from '../../types/quiz.ts'
import { apiClient } from './client.ts'

export const quizzesApi = {
  create: async (slug: string, input: CreateQuizInput) => {
    const { data } = await apiClient.post<Quiz>(
      `/roadmaps/${slug}/quizzes/`,
      input,
    )
    return data
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
}
