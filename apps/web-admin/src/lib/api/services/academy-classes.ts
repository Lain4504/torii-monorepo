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
  termId?: string | null
  code: string
  name: string
  mode: "VOD" | "LIVE"
  status: string
  _count?: {
    enrollments?: number
    liveSchedules?: number
  }
  term?: {
    termCode?: string
    openingDate?: string | null
    closingDate?: string | null
    enrollmentOpenAt?: string | null
    enrollmentCloseAt?: string | null
  } | null
  instructorId?: string | null
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
  courseEdition?: {
    id: string
    editionTag: string
    status: string
  } | null

  // Backward-compat fields (some endpoints might still include these)
  vodClass?: any | null
  liveClass?: any | null
  courseProfile?: any | null
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

  async getCurriculum(id: string) {
    const res = await apiClient.get<
      StandardApiResponse<{
        curriculum: {
          classId: string
          courseProfileId: string
          modules: {
            id: string
            title: string
            orderIndex: number
            lessons: {
              id: string
              title: string
              type: string
              orderIndex: number
            }[]
          }[]
        }
      }>
    >(`/api/academy/classes/${id}/curriculum`)
    return res.data.data!.curriculum
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
  async publish(id: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyClass }>>(
      `/api/academy/classes/${id}/publish`,
      {},
    )
    return res.data.data!.item
  },
  async start(id: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyClass }>>(
      `/api/academy/classes/${id}/start`,
      {},
    )
    return res.data.data!.item
  },
  async complete(id: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyClass }>>(
      `/api/academy/classes/${id}/complete`,
      {},
    )
    return res.data.data!.item
  },
  async cancel(id: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyClass }>>(
      `/api/academy/classes/${id}/cancel`,
      {},
    )
    return res.data.data!.item
  },
  async archive(id: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyClass }>>(
      `/api/academy/classes/${id}/archive`,
      {},
    )
    return res.data.data!.item
  },
  async findTerms(courseProfileId: string) {
    const res = await apiClient.get<StandardApiResponse<{ items: any[] }>>(
      "/api/academy/classes/selection/terms",
      { params: { courseProfileId } },
    )
    return res.data.data!.items
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

export function useAcademyClassCurriculum(classId?: string) {
  return useQuery({
    enabled: !!classId,
    queryKey: ["academy-class-curriculum", classId],
    queryFn: () => academyClassesApi.getCurriculum(classId!),
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

function invalidateClassQueries(qc: ReturnType<typeof useQueryClient>, id: string) {
  qc.invalidateQueries({ queryKey: ["academy-classes"] })
  qc.invalidateQueries({ queryKey: ["academy-class", id] })
}

export function usePublishClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyClassesApi.publish(id),
    onSuccess: (_, id) => invalidateClassQueries(qc, id),
  })
}

export function useStartClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyClassesApi.start(id),
    onSuccess: (_, id) => invalidateClassQueries(qc, id),
  })
}

export function useCompleteClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyClassesApi.complete(id),
    onSuccess: (_, id) => invalidateClassQueries(qc, id),
  })
}

export function useCancelClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyClassesApi.cancel(id),
    onSuccess: (_, id) => invalidateClassQueries(qc, id),
  })
}

export function useArchiveClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyClassesApi.archive(id),
    onSuccess: (_, id) => invalidateClassQueries(qc, id),
  })
}

export function useAcademyLiveTerms(courseProfileId?: string) {
  return useQuery({
    enabled: !!courseProfileId,
    queryKey: ["academy-live-terms", courseProfileId],
    queryFn: () => academyClassesApi.findTerms(courseProfileId!),
  })
}
