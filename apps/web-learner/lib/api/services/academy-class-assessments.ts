import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../api-client'
import type {
  AcademyClassAssessmentQueryDTO,
  StandardApiResponse,
} from '@workspace/schemas'

export type AcademyClassAssessment = {
  id: string
  classId: string
  kind: string
  quizTemplateId?: string | null
  assignmentTemplateId?: string | null
  titleOverride?: string | null
  deadline?: string | null
  weight?: number | null
  maxAttemptsOverride?: number | null
  timeLimitOverrideMinutes?: number | null
  maxScoreOverride?: number | null
  settings?: unknown
  status?: string | null
  createdAt: string
  updatedAt: string
}

export function extractAssessmentExamId(settings: unknown): string | null {
  if (!settings || typeof settings !== 'object') return null
  const map = settings as Record<string, unknown>

  const direct = map.examId
  if (typeof direct === 'string' && direct.trim()) return direct.trim()

  const nested = map.exam
  if (nested && typeof nested === 'object') {
    const nestedId = (nested as Record<string, unknown>).id
    if (typeof nestedId === 'string' && nestedId.trim()) return nestedId.trim()
  }
  return null
}

export const academyClassAssessmentsApi = {
  async findAll(params: AcademyClassAssessmentQueryDTO) {
    const res = await apiClient.get<
      StandardApiResponse<{ items: AcademyClassAssessment[] }>
    >('/api/academy/class-assessments', { params })
    return res.data.data?.items ?? []
  },

  async findById(id: string) {
    const res = await apiClient.get<
      StandardApiResponse<{ item: AcademyClassAssessment }>
    >(`/api/academy/class-assessments/${id}`)
    return res.data.data!.item
  },
}

export function useAcademyClassAssessments(params: AcademyClassAssessmentQueryDTO) {
  return useQuery({
    queryKey: ['academy-class-assessments-learner', params],
    queryFn: () => academyClassAssessmentsApi.findAll(params),
  })
}

export function useAcademyClassAssessment(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ['academy-class-assessment-learner', id],
    queryFn: () => academyClassAssessmentsApi.findById(id!),
  })
}
