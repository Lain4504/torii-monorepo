import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
}

export const academyCourseOfferingsApi = {
  async findAll(params: AcademyCourseOfferingQueryDTO) {
    const res = await apiClient.get<StandardApiResponse<{ items: AcademyCourseOffering[] }>>(
      "/api/academy/course-offerings",
      { params },
    )
    return res.data.data!.items
  },

  async findById(id: string) {
    const res = await apiClient.get<StandardApiResponse<{ item: AcademyCourseOffering }>>(
      `/api/academy/course-offerings/${id}`,
    )
    return res.data.data!.item
  },

  async create(input: AcademyCourseOfferingCreateDTO) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyCourseOffering }>>(
      "/api/academy/course-offerings",
      input,
    )
    return res.data.data!.item
  },

  async update(id: string, input: AcademyCourseOfferingUpdateDTO) {
    const res = await apiClient.put<StandardApiResponse<{ item: AcademyCourseOffering }>>(
      `/api/academy/course-offerings/${id}`,
      input,
    )
    return res.data.data!.item
  },

  async delete(id: string) {
    const res = await apiClient.delete<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/course-offerings/${id}`,
    )
    return res.data
  },

  async linkClasses(id: string, classIds: string[]) {
    const res = await apiClient.post<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/course-offerings/${id}/link-classes`,
      { classIds },
    )
    return res.data
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

