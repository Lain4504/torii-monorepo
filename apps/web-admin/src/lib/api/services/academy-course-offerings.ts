import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@workspace/ui/components/sonner"
import { apiClient } from "@/lib/api/api-client"
import type {
  AcademyCourseOfferingCreateDTO,
  AcademyCourseOfferingQueryDTO,
  AcademyCourseOfferingUpdateDTO,
  StandardApiResponse,
} from "@workspace/schemas"

export type AcademyCourseOffering = {
  id: string
  code: string
  title: string
  description?: string | null
  price: number
  originalPrice?: number | string | null
  currency: string
  status?: string | null
  salesStartAt?: string | null
  salesEndAt?: string | null
  metadata?: unknown | null
  classes?: any[]
  validFrom?: string | null
  validTo?: string | null
  createdAt: string
  updatedAt: string
  rejectedAt: string | null
  rejectedBy: string | null
  rejectionReason: string | null
  submittedForApprovalAt: string | null
  submittedBy: string | null
  approvedAt: string | null
  approvedBy: string | null
}

function normalizeCourseOffering(item: any): AcademyCourseOffering {
  const normalizedPrice = Number(item?.originalPrice ?? item?.price ?? 0)
  return {
    ...item,
    price: Number.isFinite(normalizedPrice) ? normalizedPrice : 0,
    originalPrice: item?.originalPrice ?? item?.price ?? null,
    salesStartAt: item?.salesStartAt ?? item?.validFrom ?? null,
    salesEndAt: item?.salesEndAt ?? item?.validTo ?? null,
  }
}

export const academyCourseOfferingsApi = {
  async findAll(params: AcademyCourseOfferingQueryDTO) {
    const res = await apiClient.get<StandardApiResponse<{ items: AcademyCourseOffering[] }>>(
      "/api/academy/course-offerings",
      { params },
    )
    return res.data.data!.items.map((item) => normalizeCourseOffering(item))
  },

  async findById(id: string) {
    const res = await apiClient.get<StandardApiResponse<{ item: AcademyCourseOffering }>>(
      `/api/academy/course-offerings/${id}`,
    )
    return normalizeCourseOffering(res.data.data!.item)
  },

  async create(input: AcademyCourseOfferingCreateDTO) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyCourseOffering }>>(
      "/api/academy/course-offerings",
      input,
    )
    return normalizeCourseOffering(res.data.data!.item)
  },

  async update(id: string, input: AcademyCourseOfferingUpdateDTO) {
    const res = await apiClient.put<StandardApiResponse<{ item: AcademyCourseOffering }>>(
      `/api/academy/course-offerings/${id}`,
      input,
    )
    return normalizeCourseOffering(res.data.data!.item)
  },

  async archive(id: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyCourseOffering }>>(
      `/api/academy/course-offerings/${id}/archive`,
      {},
    )
    return normalizeCourseOffering(res.data.data!.item)
  },

  async delete(id: string) {
    const res = await apiClient.delete<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/course-offerings/${id}`,
    )
    return res.data
  },

  async linkClasses(id: string, classIds: string[]) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyCourseOffering }>>(
      `/api/academy/course-offerings/${id}/set-classes`,
      { classIds },
    )
    return normalizeCourseOffering(res.data.data!.item)
  },
  async submitForApproval(id: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyCourseOffering }>>(
      `/api/academy/course-offerings/${id}/submit-for-approval`,
      {},
    )
    return normalizeCourseOffering(res.data.data!.item)
  },
  async approve(id: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyCourseOffering }>>(
      `/api/academy/course-offerings/${id}/approve`,
      {},
    )
    return normalizeCourseOffering(res.data.data!.item)
  },
  async reject(id: string, reason: string) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyCourseOffering }>>(
      `/api/academy/course-offerings/${id}/reject`,
      { reason },
    )
    return normalizeCourseOffering(res.data.data!.item)
  },
  async findClassesForSelection(params: { mode?: string; q?: string }) {
    const res = await apiClient.get<StandardApiResponse<{ items: any[] }>>(
      "/api/academy/course-offerings/selection/classes",
      { params },
    )
    return res.data.data!.items
  },
}

export function useAcademyCourseOfferings(params: AcademyCourseOfferingQueryDTO) {
  return useQuery({
    queryKey: ["academy-course-offerings", params],
    queryFn: () => academyCourseOfferingsApi.findAll(params),
  })
}

export function useAcademyCourseOffering(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["academy-course-offering", id],
    queryFn: () => academyCourseOfferingsApi.findById(id!),
  })
}

export function useCreateAcademyCourseOffering() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyCourseOfferingsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-course-offerings"] }),
  })
}

export function useUpdateAcademyCourseOffering() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AcademyCourseOfferingUpdateDTO }) =>
      academyCourseOfferingsApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-course-offerings"] }),
  })
}

export function useArchiveAcademyCourseOffering() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyCourseOfferingsApi.archive(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["academy-course-offerings"] })
      qc.invalidateQueries({ queryKey: ["academy-course-offering", id] })
    },
  })
}

export function useDeleteAcademyCourseOffering() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyCourseOfferingsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-course-offerings"] }),
  })
}

export function useLinkAcademyCourseOfferingClasses() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, classIds }: { id: string; classIds: string[] }) =>
      academyCourseOfferingsApi.linkClasses(id, classIds),
    onSuccess: (_, { id }) =>
      qc.invalidateQueries({ queryKey: ["academy-course-offering", id] }),
  })
}

export function useSubmitCourseOfferingForApproval() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyCourseOfferingsApi.submitForApproval(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["academy-course-offerings"] })
      qc.invalidateQueries({ queryKey: ["academy-course-offering", id] })
      toast.success("Đã gửi duyệt gói bán")
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Gửi duyệt thất bại"
      toast.error(message)
    },
  })
}

export function useApproveCourseOffering() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyCourseOfferingsApi.approve(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["academy-course-offerings"] })
      qc.invalidateQueries({ queryKey: ["academy-course-offering", id] })
    },
  })
}

export function useRejectCourseOffering() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      academyCourseOfferingsApi.reject(id, reason),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["academy-course-offerings"] })
      qc.invalidateQueries({ queryKey: ["academy-course-offering", id] })
    },
  })
}

export function useAvailableClassesForOffering(params: { mode?: string; q?: string }) {
  return useQuery({
    queryKey: ["academy-course-offering-classes-selection", params],
    queryFn: () => academyCourseOfferingsApi.findClassesForSelection(params),
  })
}

