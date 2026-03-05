import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type {
  AcademyLessonCreateDto,
  AcademyLessonQueryDto,
  AcademyLessonUpdateDto,
  StandardApiResponse,
} from "@workspace/schemas"

export type AcademyLesson = {
  id: string
  courseProfileId: string
  title: string
  contentType: string
  contentUrl?: string | null
  contentBody?: string | null
  attachments?: any | null
  metadata?: any | null
  createdAt: string
  updatedAt: string
}

export const academyLessonsApi = {
  async findAll(params: AcademyLessonQueryDto) {
    const res = await apiClient.get<StandardApiResponse<{ items: AcademyLesson[] }>>(
      "/api/academy/lessons",
      { params },
    )
    return res.data.data!.items
  },

  async findById(id: string) {
    const res = await apiClient.get<StandardApiResponse<{ item: AcademyLesson }>>(
      `/api/academy/lessons/${id}`,
    )
    return res.data.data!.item
  },

  async create(input: AcademyLessonCreateDto) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyLesson }>>(
      "/api/academy/lessons",
      input,
    )
    return res.data.data!.item
  },

  async update(id: string, input: AcademyLessonUpdateDto) {
    const res = await apiClient.put<StandardApiResponse<{ item: AcademyLesson }>>(
      `/api/academy/lessons/${id}`,
      input,
    )
    return res.data.data!.item
  },

  async delete(id: string) {
    const res = await apiClient.delete<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/lessons/${id}`,
    )
    return res.data
  },
}

export function useAcademyLessons(params: AcademyLessonQueryDto) {
  return useQuery({
    queryKey: ["academy-lessons", params],
    queryFn: () => academyLessonsApi.findAll(params),
  })
}

export function useAcademyLesson(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["academy-lesson", id],
    queryFn: () => academyLessonsApi.findById(id!),
  })
}

export function useCreateAcademyLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyLessonsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-lessons"] }),
  })
}

export function useUpdateAcademyLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AcademyLessonUpdateDto }) =>
      academyLessonsApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-lessons"] }),
  })
}

export function useDeleteAcademyLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyLessonsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-lessons"] }),
  })
}
