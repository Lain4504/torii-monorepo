import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type {
  AcademyCourseEditionCreateDTO,
  AcademyCourseEditionQueryDTO,
  AcademyCourseEditionUpdateDTO,
  StandardApiResponse,
} from "@workspace/schemas"

export type AcademyCourseEdition = {
  id: string
  courseProfileId: string
  editionTag: string
  isCurrent: boolean
  status?: string | null
  syllabusSnapshot?: unknown | null
  changelog?: string | null
  createdAt: string
  updatedAt: string
  title?: string
  version?: string
  courseProfile?: {
    title: string
    code: string
  }
}

export const academyCourseEditionsApi = {
  async findAll(params: AcademyCourseEditionQueryDTO) {
    const res = await apiClient.get<StandardApiResponse<{ items: AcademyCourseEdition[] }>>(
      "/api/academy/course-editions",
      { params },
    )
    return res.data.data!.items
  },

  async findByCourseProfileId(courseProfileId: string) {
    const res = await apiClient.get<StandardApiResponse<{ items: AcademyCourseEdition[] }>>(
      `/api/academy/course-editions/by-course-profile/${courseProfileId}`,
    )
    return res.data.data!.items
  },

  async findById(id: string) {
    const res = await apiClient.get<StandardApiResponse<{ item: AcademyCourseEdition }>>(
      `/api/academy/course-editions/${id}`,
    )
    return res.data.data!.item
  },

  async create(input: AcademyCourseEditionCreateDTO) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyCourseEdition }>>(
      "/api/academy/course-editions",
      input,
    )
    return res.data.data!.item
  },

  async update(id: string, input: AcademyCourseEditionUpdateDTO) {
    const res = await apiClient.put<StandardApiResponse<{ item: AcademyCourseEdition }>>(
      `/api/academy/course-editions/${id}`,
      input,
    )
    return res.data.data!.item
  },

  async setCurrent(id: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyCourseEdition }>>(
      `/api/academy/course-editions/${id}/set-current`,
      {},
    )
    return res.data.data!.item
  },

  async delete(id: string) {
    const res = await apiClient.delete<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/course-editions/${id}`,
    )
    return res.data
  },
}

export function useAcademyCourseEditions(params: AcademyCourseEditionQueryDTO) {
  return useQuery({
    queryKey: ["academy-course-editions", params],
    queryFn: () => {
      if (params.courseProfileId && Object.keys(params).length === 1) {
        return academyCourseEditionsApi.findByCourseProfileId(params.courseProfileId)
      }
      return academyCourseEditionsApi.findAll(params)
    },
  })
}

export function useAcademyCourseEdition(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["academy-course-edition", id],
    queryFn: () => academyCourseEditionsApi.findById(id!),
  })
}

export function useCreateAcademyCourseEdition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyCourseEditionsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-course-editions"] }),
  })
}

export function useUpdateAcademyCourseEdition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AcademyCourseEditionUpdateDTO }) =>
      academyCourseEditionsApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-course-editions"] }),
  })
}

export function useSetCurrentAcademyCourseEdition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyCourseEditionsApi.setCurrent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-course-editions"] }),
  })
}

export function useDeleteAcademyCourseEdition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyCourseEditionsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-course-editions"] }),
  })
}

