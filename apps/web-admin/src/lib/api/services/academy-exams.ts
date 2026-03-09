import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type {
  AcademyExamAddQuestionsDTO,
  AcademyExamAddQuestionsFromPoolDTO,
  AcademyExamCreateDTO,
  AcademyExamQueryDTO,
  AcademyExamUpdateDTO,
  StandardApiResponse,
} from "@workspace/schemas"

export type AcademyExam = {
  id: string
  courseProfileId?: string | null
  title: string
  description?: string | null
  examType: string
  level?: string | null
  totalTimeLimitMinutes?: number | null
  status?: string | null
  settings?: unknown | null
  sections?: unknown[]
  examQuestions?: unknown[]
  createdAt: string
  updatedAt: string
}

export const academyExamsApi = {
  async findAll(params: AcademyExamQueryDTO) {
    const res = await apiClient.get<StandardApiResponse<{ items: AcademyExam[] }>>(
      "/api/academy/exams",
      { params },
    )
    return res.data.data!.items
  },

  async findById(id: string) {
    const res = await apiClient.get<StandardApiResponse<{ item: AcademyExam }>>(
      `/api/academy/exams/${id}`,
    )
    return res.data.data!.item
  },

  async create(input: AcademyExamCreateDTO) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyExam }>>(
      "/api/academy/exams",
      input,
    )
    return res.data.data!.item
  },

  async update(id: string, input: AcademyExamUpdateDTO) {
    const res = await apiClient.put<StandardApiResponse<{ item: AcademyExam }>>(
      `/api/academy/exams/${id}`,
      input,
    )
    return res.data.data!.item
  },

  async delete(id: string) {
    const res = await apiClient.delete<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/exams/${id}`,
    )
    return res.data
  },

  async addQuestionsFromPool(data: AcademyExamAddQuestionsFromPoolDTO & { examId: string }) {
    const res = await apiClient.post<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/exams/${data.examId}/questions-from-pool`,
      {
        sectionId: data.sectionId,
        poolId: data.poolId,
        count: data.count,
      },
    )
    return res.data
  },

  async addQuestions(data: AcademyExamAddQuestionsDTO & { examId: string }) {
    const res = await apiClient.post<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/exams/${data.examId}/questions`,
      {
        sectionId: data.sectionId,
        questionIds: data.questionIds,
        points: data.points,
      },
    )
    return res.data
  },
}

export function useAcademyExams(params: AcademyExamQueryDTO) {
  return useQuery({
    queryKey: ["academy-exams", params],
    queryFn: () => academyExamsApi.findAll(params),
  })
}

export function useAcademyExam(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["academy-exam", id],
    queryFn: () => academyExamsApi.findById(id!),
  })
}

export function useCreateAcademyExam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyExamsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-exams"] }),
  })
}

export function useUpdateAcademyExam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AcademyExamUpdateDTO }) =>
      academyExamsApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-exams"] }),
  })
}

export function useDeleteAcademyExam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyExamsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-exams"] }),
  })
}

export function useAddQuestionsFromPool() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyExamsApi.addQuestionsFromPool,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["academy-exam", variables.examId] })
    },
  })
}

export function useAddQuestionsToExam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyExamsApi.addQuestions,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["academy-exam", variables.examId] })
    },
  })
}
