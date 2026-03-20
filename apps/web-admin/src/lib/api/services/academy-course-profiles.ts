import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type {
  AcademyCourseProfileCreateDTO,
  AcademyCourseProfileQueryDTO,
  AcademyCourseProfileUpdateDTO,
  StandardApiResponse,
} from "@workspace/schemas"

export type AcademyCourseProfile = {
  id: string
  code: string
  title: string
  status: string
  description?: string | null
  level?: string | null
  thumbnailUrl?: string | null
  createdAt: string
  updatedAt: string
  modules?: any[]
}

export const academyCourseProfilesApi = {
  async findAll(params: AcademyCourseProfileQueryDTO) {
    const res = await apiClient.get<StandardApiResponse<{ items: AcademyCourseProfile[] }>>(
      "/api/academy/course-profiles",
      { params },
    )
    return res.data.data!.items
  },

  async findById(id: string) {
    const res = await apiClient.get<StandardApiResponse<{ item: AcademyCourseProfile }>>(
      `/api/academy/course-profiles/${id}`,
    )
    return res.data.data!.item
  },

  async create(input: AcademyCourseProfileCreateDTO) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyCourseProfile }>>(
      "/api/academy/course-profiles",
      input,
    )
    return res.data.data!.item
  },

  async update(id: string, input: AcademyCourseProfileUpdateDTO) {
    const res = await apiClient.put<StandardApiResponse<{ item: AcademyCourseProfile }>>(
      `/api/academy/course-profiles/${id}`,
      input,
    )
    return res.data.data!.item
  },

  async duplicate(id: string, input: { newCode: string; newTitle: string }) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyCourseProfile }>>(
      `/api/academy/course-profiles/${id}/duplicate`,
      input,
    )
    return res.data.data!.item
  },

  async archive(id: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyCourseProfile }>>(
      `/api/academy/course-profiles/${id}/archive`,
      {},
    )
    return res.data.data!.item
  },

  async delete(id: string) {
    const res = await apiClient.delete<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/course-profiles/${id}`,
    )
    return res.data
  },
}

export function useAcademyCourseProfiles(params: AcademyCourseProfileQueryDTO) {
  return useQuery({
    queryKey: ["academy-course-profiles", params],
    queryFn: () => academyCourseProfilesApi.findAll(params),
  })
}

export function useAcademyCourseProfile(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["academy-course-profile", id],
    queryFn: () => academyCourseProfilesApi.findById(id!),
  })
}

export function useCreateAcademyCourseProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyCourseProfilesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-course-profiles"] }),
  })
}

export function useUpdateAcademyCourseProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AcademyCourseProfileUpdateDTO }) =>
      academyCourseProfilesApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-course-profiles"] }),
  })
}

export function useArchiveAcademyCourseProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyCourseProfilesApi.archive(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["academy-course-profiles"] })
      qc.invalidateQueries({ queryKey: ["academy-course-profile", id] })
    },
  })
}

export function useDeleteAcademyCourseProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyCourseProfilesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-course-profiles"] }),
  })
}

