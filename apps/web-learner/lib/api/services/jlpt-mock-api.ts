import { useQuery } from "@tanstack/react-query"
import { apiClient } from "../api-client"
import type { StandardApiResponse } from "@workspace/schemas"

export type JlptMockTemplateSection = {
  id: string
  code: string
  title: string
  durationMinutes: number
  orderIndex: number
  isListening: boolean
}

export type JlptMockTemplateQuestion = {
  id: string
  sectionId: string
  mondaiId: string | null
  questionId: string
  orderIndex: number
  question: {
    id: string
    stemText: string
    contextText?: string | null
    sectionCode: string
    options: {
      id: string
      key: string
      contentText: string
      orderIndex: number
    }[]
  }
}

export type JlptMockTemplate = {
  id: string
  code: string
  title: string
  level: { code: string }
  sections: JlptMockTemplateSection[]
  questions: JlptMockTemplateQuestion[]
}

export type JlptMockAttempt = {
  id: string
  templateId: string
  status: string
  levelCode: string
  startedAt?: string | null
  deadlineAt?: string | null
}

export const jlptMockApi = {
  async findTemplates(params: { levelCode?: string } = {}) {
    const res = await apiClient.get<
      StandardApiResponse<{ items: { id: string; code: string; title: string; levelCode: string; totalDurationMinutes?: number | null }[] }>
    >("/api/academy/jlpt-mock/templates", {
      params,
    })
    return res.data.data?.items ?? []
  },

  async findTemplateById(id: string): Promise<JlptMockTemplate> {
    const res = await apiClient.get<
      StandardApiResponse<{ item: JlptMockTemplate }>
    >(`/api/academy/jlpt-mock/templates/${id}`)
    return res.data.data!.item
  },

  async startAttempt(dto: { templateId: string }) {
    const res = await apiClient.post<
      StandardApiResponse<{ item: { attemptId: string } }>
    >("/api/academy/jlpt-mock/attempts/start", dto)
    const payload = res.data.data!.item
    return { id: payload.attemptId, templateId: dto.templateId } as JlptMockAttempt
  },

  async saveAnswers(dto: {
    attemptId: string
    answers: { templateQuestionId: string; selectedOptionId?: string }[]
  }) {
    const res = await apiClient.post<
      StandardApiResponse<{ item: JlptMockAttempt }>
    >("/api/academy/jlpt-mock/attempts/save-answers", dto)
    return res.data.data!.item
  },

  async nextSection(dto: { attemptId: string; currentSectionOrder: number }) {
    const res = await apiClient.post<
      StandardApiResponse<{ item: { currentSectionOrder: number; endsAt?: string } }>
    >("/api/academy/jlpt-mock/attempts/next-section", dto)
    return res.data.data!.item
  },

  async submitAttempt(dto: { attemptId: string }) {
    const res = await apiClient.post<
      StandardApiResponse<{ item: JlptMockAttempt }>
    >("/api/academy/jlpt-mock/attempts/submit", dto)
    return res.data.data!.item
  },

  async getAttemptById(id: string) {
    const res = await apiClient.get<
      StandardApiResponse<{ item: JlptMockAttempt }>
    >(`/api/academy/jlpt-mock/attempts/${id}`)
    return res.data.data!.item
  },
}

export function useJlptMockTemplates(levelCode?: string) {
  return useQuery({
    queryKey: ["jlpt-mock-templates", levelCode ?? "all"],
    queryFn: () => jlptMockApi.findTemplates({ levelCode }),
  })
}

