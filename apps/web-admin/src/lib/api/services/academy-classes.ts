import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type {
  AcademyClassCreateDTO,
  AcademyClassDuplicateDTO,
  AcademyClassQueryDTO,
  AcademyClassUpdateDTO,
  StandardApiResponse,
} from "@workspace/schemas"

export type AcademyClass = {
  id: string
  courseProfileId: string
  courseEditionId: string
  code: string
  name: string
  mode: "VOD" | "LIVE"
  status: string
  createdAt: string
  updatedAt: string
  settings?: any
  rejectedAt: string | null
  rejectedBy: string | null
  rejectionReason: string | null
  submittedForApprovalAt: string | null
  submittedBy: string | null
  approvedAt: string | null
  approvedBy: string | null

  // TPT Relations
  vodClass?: {
    id: string
    enrollmentOpenAt?: string | null
    enrollmentCloseAt?: string | null
    maxStudents?: number | null
    defaultExpiresMonths?: number | null
  } | null
  liveClass?: {
    id: string
    term?: string | null
    batch?: string | null
    startDate?: string | null
    endDate?: string | null
    enrollmentOpenAt?: string | null
    enrollmentCloseAt?: string | null
    minStudents?: number | null
    maxStudents?: number | null
    minStudentsEnforcement?: string | null
    primaryTeacherId?: string | null
    primaryTeacher?: {
      id: string
      displayName: string
      avatarUrl?: string | null
    } | null
  } | null
}

export const academyClassesApi = {
  async findAll(params: AcademyClassQueryDTO) {
    const res = await apiClient.get<StandardApiResponse<{ items: AcademyClass[] }>>(
      "/api/academy/classes",
      { params },
    )
    return res.data.data!.items
  },

  async findById(id: string) {
    const res = await apiClient.get<StandardApiResponse<{ item: AcademyClass }>>(
      `/api/academy/classes/${id}`,
    )
    return res.data.data!.item
  },

  async create(input: AcademyClassCreateDTO) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyClass }>>(
      "/api/academy/classes",
      input,
    )
    return res.data.data!.item
  },

  async update(id: string, input: AcademyClassUpdateDTO) {
    const res = await apiClient.put<StandardApiResponse<{ item: AcademyClass }>>(
      `/api/academy/classes/${id}`,
      input,
    )
    return res.data.data!.item
  },

  async delete(id: string) {
    const res = await apiClient.delete<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/classes/${id}`,
    )
    return res.data
  },
  async submitForApproval(id: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyClass }>>(
      `/api/academy/classes/${id}/submit-for-approval`,
      {},
    )
    return res.data.data!.item
  },
  async approve(id: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyClass }>>(
      `/api/academy/classes/${id}/approve`,
      {},
    )
    return res.data.data!.item
  },
  async reject(id: string, reason: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyClass }>>(
      `/api/academy/classes/${id}/reject`,
      { reason },
    )
    return res.data.data!.item
  },
  async duplicate(id: string, input: AcademyClassDuplicateDTO) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyClass }>>(
      `/api/academy/classes/${id}/duplicate`,
      input,
    )
    return res.data.data!.item
  },
}

export function useAcademyClasses(params: AcademyClassQueryDTO) {
  return useQuery({
    queryKey: ["academy-classes", params],
    queryFn: () => academyClassesApi.findAll(params),
  })
}

export function useAcademyClass(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["academy-class", id],
    queryFn: () => academyClassesApi.findById(id!),
  })
}

export function useCreateAcademyClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyClassesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-classes"] }),
  })
}

export function useUpdateAcademyClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AcademyClassUpdateDTO }) =>
      academyClassesApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-classes"] }),
  })
}

export function useDeleteAcademyClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyClassesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-classes"] }),
  })
}

export function useSubmitClassForApproval() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyClassesApi.submitForApproval(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["academy-classes"] })
      qc.invalidateQueries({ queryKey: ["academy-class", id] })
    },
  })
}

export function useApproveClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyClassesApi.approve(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["academy-classes"] })
      qc.invalidateQueries({ queryKey: ["academy-class", id] })
    },
  })
}

export function useRejectClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      academyClassesApi.reject(id, reason),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["academy-classes"] })
      qc.invalidateQueries({ queryKey: ["academy-class", id] })
    },
  })
}

export function useDuplicateAcademyClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AcademyClassDuplicateDTO }) =>
      academyClassesApi.duplicate(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-classes"] }),
  })
}
