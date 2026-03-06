import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type {
  AcademyChapterCreateDTO,
  AcademyChapterQueryDTO,
  AcademyChapterUpdateDTO,
  StandardApiResponse,
} from "@workspace/schemas"

export type AcademyChapter = {
  id: string
  courseEditionId: string
  title: string
  description?: string | null
  orderIndex: number
  estimatedMinutes?: number | null
  status?: string | null
  createdAt: string
  updatedAt: string
}

export const academyChaptersApi = {
  async findAll(params: AcademyChapterQueryDTO) {
    const res = await apiClient.get<StandardApiResponse<{ items: AcademyChapter[] }>>(
      "/api/academy/chapters",
      { params },
    )
    return res.data.data!.items
  },

  async findById(id: string) {
    const res = await apiClient.get<StandardApiResponse<{ item: AcademyChapter }>>(
      `/api/academy/chapters/${id}`,
    )
    return res.data.data!.item
  },

  async create(input: AcademyChapterCreateDTO) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyChapter }>>(
      "/api/academy/chapters",
      input,
    )
    return res.data.data!.item
  },

  async update(id: string, input: AcademyChapterUpdateDTO) {
    const res = await apiClient.put<StandardApiResponse<{ item: AcademyChapter }>>(
      `/api/academy/chapters/${id}`,
      input,
    )
    return res.data.data!.item
  },

  async delete(id: string) {
    const res = await apiClient.delete<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/chapters/${id}`,
    )
    return res.data
  },
}

export function useAcademyChapters(
  params: AcademyChapterQueryDTO,
  options?: Omit<UseQueryOptions<AcademyChapter[]>, "queryKey" | "queryFn">
) {
  return useQuery<AcademyChapter[]>({
    queryKey: ["academy-chapters", params],
    queryFn: () => academyChaptersApi.findAll(params),
    ...options
  })
}

export function useAcademyChapter(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["academy-chapter", id],
    queryFn: () => academyChaptersApi.findById(id!),
  })
}

export function useCreateAcademyChapter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyChaptersApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-chapters"] }),
  })
}

export function useUpdateAcademyChapter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AcademyChapterUpdateDTO }) =>
      academyChaptersApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-chapters"] }),
  })
}

export function useDeleteAcademyChapter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyChaptersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-chapters"] }),
  })
}

