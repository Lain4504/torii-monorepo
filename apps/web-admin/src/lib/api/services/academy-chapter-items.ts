import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type {
  AcademyChapterItemCreateDTO,
  AcademyChapterItemQueryDTO,
  AcademyChapterItemUpdateDTO,
  StandardApiResponse,
} from "@workspace/schemas"

export type AcademyChapterItem = {
  id: string
  chapterId: string
  title: string
  kind: string
  referenceId: string
  orderIndex: number
  metadata?: unknown | null
  createdAt: string
  updatedAt: string
}

export const academyChapterItemsApi = {
  async findAll(params: AcademyChapterItemQueryDTO) {
    const res = await apiClient.get<StandardApiResponse<{ items: AcademyChapterItem[] }>>(
      "/api/academy/chapter-items",
      { params },
    )
    return res.data.data!.items
  },

  async findById(id: string) {
    const res = await apiClient.get<StandardApiResponse<{ item: AcademyChapterItem }>>(
      `/api/academy/chapter-items/${id}`,
    )
    return res.data.data!.item
  },

  async create(input: AcademyChapterItemCreateDTO) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyChapterItem }>>(
      "/api/academy/chapter-items",
      input,
    )
    return res.data.data!.item
  },

  async update(id: string, input: AcademyChapterItemUpdateDTO) {
    const res = await apiClient.put<StandardApiResponse<{ item: AcademyChapterItem }>>(
      `/api/academy/chapter-items/${id}`,
      input,
    )
    return res.data.data!.item
  },

  async delete(id: string) {
    const res = await apiClient.delete<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/chapter-items/${id}`,
    )
    return res.data
  },
}

export function useAcademyChapterItems(params: AcademyChapterItemQueryDTO) {
  return useQuery({
    queryKey: ["academy-chapter-items", params],
    queryFn: () => academyChapterItemsApi.findAll(params),
  })
}

export function useAcademyChapterItem(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["academy-chapter-item", id],
    queryFn: () => academyChapterItemsApi.findById(id!),
  })
}

export function useCreateAcademyChapterItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyChapterItemsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-chapter-items"] }),
  })
}

export function useUpdateAcademyChapterItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AcademyChapterItemUpdateDTO }) =>
      academyChapterItemsApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-chapter-items"] }),
  })
}

export function useDeleteAcademyChapterItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyChapterItemsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-chapter-items"] }),
  })
}

