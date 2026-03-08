import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type {
  AcademyQuestionCreateDTO,
  AcademyQuestionQueryDTO,
  AcademyQuestionUpdateDTO,
  StandardApiResponse,
} from "@workspace/schemas"

export type AcademyQuestion = {
  id: string
  parentId?: string | null
  content: string
  mediaUrl?: string | null
  questionType: string
  options?: unknown | null
  correctAnswer?: unknown | null
  explanation?: string | null
  level?: string | null
  category?: string | null
  metadata?: unknown | null
  createdAt: string
  updatedAt: string
}

export const academyQuestionsApi = {
  async findAll(params: AcademyQuestionQueryDTO) {
    const res = await apiClient.get<StandardApiResponse<{ items: AcademyQuestion[] }>>(
      "/api/academy/questions",
      { params },
    )
    return res.data.data!.items
  },

  async findById(id: string) {
    const res = await apiClient.get<StandardApiResponse<{ item: AcademyQuestion }>>(
      `/api/academy/questions/${id}`,
    )
    return res.data.data!.item
  },

  async create(input: AcademyQuestionCreateDTO) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyQuestion }>>(
      "/api/academy/questions",
      input,
    )
    return res.data.data!.item
  },

  async update(id: string, input: AcademyQuestionUpdateDTO) {
    const res = await apiClient.put<StandardApiResponse<{ item: AcademyQuestion }>>(
      `/api/academy/questions/${id}`,
      input,
    )
    return res.data.data!.item
  },

  async delete(id: string) {
    const res = await apiClient.delete<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/questions/${id}`,
    )
    return res.data
  },
}

export function useAcademyQuestions(params: AcademyQuestionQueryDTO) {
  return useQuery({
    queryKey: ["academy-questions", params],
    queryFn: () => academyQuestionsApi.findAll(params),
  })
}

export function useAcademyQuestion(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["academy-question", id],
    queryFn: () => academyQuestionsApi.findById(id!),
  })
}

export function useCreateAcademyQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyQuestionsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-questions"] }),
  })
}

export function useUpdateAcademyQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AcademyQuestionUpdateDTO }) =>
      academyQuestionsApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-questions"] }),
  })
}

export function useDeleteAcademyQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyQuestionsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-questions"] }),
  })
}

