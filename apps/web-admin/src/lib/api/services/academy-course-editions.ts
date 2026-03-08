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
  status: string | null
  syllabusSnapshot?: any | null
  changelog?: string | null
  metadata?: any | null
  createdAt: string
  updatedAt: string
  title?: string
  version?: string
  rejectedAt: string | null
  rejectedBy: string | null
  rejectionReason: string | null
  submittedForApprovalAt: string | null
  submittedBy: string | null
  approvedAt: string | null
  approvedBy: string | null
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
  async submitForApproval(id: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyCourseEdition }>>(
      `/api/academy/course-editions/${id}/submit-for-approval`,
      {},
    )
    return res.data.data!.item
  },
  async approve(id: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyCourseEdition }>>(
      `/api/academy/course-editions/${id}/approve`,
      {},
    )
    return res.data.data!.item
  },
  async reject(id: string, reason: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyCourseEdition }>>(
      `/api/academy/course-editions/${id}/reject`,
      { reason },
    )
    return res.data.data!.item
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

export function useSubmitCourseEditionForApproval() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyCourseEditionsApi.submitForApproval(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["academy-course-editions"] })
      qc.invalidateQueries({ queryKey: ["academy-course-edition", id] })
    },
  })
}

export function useApproveCourseEdition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyCourseEditionsApi.approve(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["academy-course-editions"] })
      qc.invalidateQueries({ queryKey: ["academy-course-edition", id] })
    },
  })
}

export function useRejectCourseEdition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      academyCourseEditionsApi.reject(id, reason),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["academy-course-editions"] })
      qc.invalidateQueries({ queryKey: ["academy-course-edition", id] })
    },
  })
}

