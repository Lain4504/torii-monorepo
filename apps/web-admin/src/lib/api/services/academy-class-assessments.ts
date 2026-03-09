import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type {
  AcademyClassAssessmentCreateDTO,
  AcademyClassAssessmentQueryDTO,
  AcademyClassAssessmentUpdateDTO,
  StandardApiResponse,
} from "@workspace/schemas"

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

export type AcademyClassAssessmentAttempt = {
  id: string
  examId: string
  classId?: string | null
  userId: string
  classAssessmentId?: string | null
  status: string
  rawScore?: number | null
  maxScore?: number | null
  percentage?: number | null
  isPassed?: boolean | null
  submittedAt?: string | null
  createdAt: string
  updatedAt: string
  user?: { id: string; displayName?: string | null; email?: string | null } | null
}

export type AcademyWrongQuestionAnalytics = {
  totalAttempts: number
  totalWrongAnswers: number
  questions: Array<{
    questionId: string
    questionContent: string
    questionType: string
    attempts: number
    wrongCount: number
    wrongRatePercent: number
  }>
}

export type AcademyClassAssessmentAttemptQueryDTO = {
  status?: string
  userId?: string
  fromDate?: Date
  toDate?: Date
  latestOnly?: boolean
}

export const academyClassAssessmentsApi = {
  async findAll(params: AcademyClassAssessmentQueryDTO) {
    const res = await apiClient.get<
      StandardApiResponse<{ items: AcademyClassAssessment[] }>
    >("/api/academy/class-assessments", {
      params,
    })
    return res.data.data!.items
  },

  async findById(id: string) {
    const res = await apiClient.get<
      StandardApiResponse<{ item: AcademyClassAssessment }>
    >(`/api/academy/class-assessments/${id}`)
    return res.data.data!.item
  },

  async create(input: AcademyClassAssessmentCreateDTO) {
    const res = await apiClient.post<
      StandardApiResponse<{ item: AcademyClassAssessment }>
    >("/api/academy/class-assessments", input)
    return res.data.data!.item
  },

  async update(id: string, input: AcademyClassAssessmentUpdateDTO) {
    const res = await apiClient.put<
      StandardApiResponse<{ item: AcademyClassAssessment }>
    >(`/api/academy/class-assessments/${id}`, input)
    return res.data.data!.item
  },

  async delete(id: string) {
    const res = await apiClient.delete<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/class-assessments/${id}`,
    )
    return res.data
  },

  async findAttemptsByAssessment(id: string, params: AcademyClassAssessmentAttemptQueryDTO) {
    const res = await apiClient.get<
      StandardApiResponse<{ items: AcademyClassAssessmentAttempt[] }>
    >(`/api/academy/class-assessments/${id}/attempts`, { params })
    return res.data.data!.items
  },

  async findAttemptQuestionDetail(id: string, attemptId: string) {
    const res = await apiClient.get<StandardApiResponse<{ item: any }>>(
      `/api/academy/class-assessments/${id}/attempts/${attemptId}/detail`,
    )
    return res.data.data!.item
  },

  async findWrongQuestionAnalytics(id: string, params: AcademyClassAssessmentAttemptQueryDTO) {
    const res = await apiClient.get<
      StandardApiResponse<{ item: AcademyWrongQuestionAnalytics }>
    >(`/api/academy/class-assessments/${id}/wrong-question-analytics`, { params })
    return res.data.data!.item
  },
}

export function useAcademyClassAssessments(
  params: AcademyClassAssessmentQueryDTO,
) {
  return useQuery({
    queryKey: ["academy-class-assessments", params],
    queryFn: () => academyClassAssessmentsApi.findAll(params),
  })
}

export function useAcademyClassAssessment(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["academy-class-assessment", id],
    queryFn: () => academyClassAssessmentsApi.findById(id!),
  })
}

export function useCreateAcademyClassAssessment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyClassAssessmentsApi.create,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["academy-class-assessments"] }),
  })
}

export function useUpdateAcademyClassAssessment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: AcademyClassAssessmentUpdateDTO
    }) => academyClassAssessmentsApi.update(id, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["academy-class-assessments"] }),
  })
}

export function useDeleteAcademyClassAssessment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyClassAssessmentsApi.delete(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["academy-class-assessments"] }),
  })
}

export function useAcademyClassAssessmentAttempts(
  id?: string,
  params: AcademyClassAssessmentAttemptQueryDTO = {},
) {
  return useQuery({
    enabled: !!id,
    queryKey: ["academy-class-assessment-attempts", id, params],
    queryFn: () => academyClassAssessmentsApi.findAttemptsByAssessment(id!, params),
  })
}

export function useAcademyClassAssessmentAttemptQuestionDetail(
  id?: string,
  attemptId?: string,
) {
  return useQuery({
    enabled: !!id && !!attemptId,
    queryKey: ["academy-class-assessment-attempt-detail", id, attemptId],
    queryFn: () => academyClassAssessmentsApi.findAttemptQuestionDetail(id!, attemptId!),
  })
}

export function useAcademyWrongQuestionAnalytics(
  id?: string,
  params: AcademyClassAssessmentAttemptQueryDTO = {},
) {
  return useQuery({
    enabled: !!id,
    queryKey: ["academy-class-assessment-wrong-question-analytics", id, params],
    queryFn: () => academyClassAssessmentsApi.findWrongQuestionAnalytics(id!, params),
  })
}

