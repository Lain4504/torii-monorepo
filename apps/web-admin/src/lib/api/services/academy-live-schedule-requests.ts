import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type {
  AcademyLiveScheduleRequestApproveDTO,
  AcademyLiveScheduleRequestCreateDTO,
  AcademyLiveScheduleRequestQueryDTO,
  AcademyLiveScheduleRequestRejectDTO,
  StandardApiResponse,
} from "@workspace/schemas"

export type AcademyLiveScheduleRequest = {
  id: string
  liveScheduleId: string
  requestedBy: string
  type: "LEAVE" | "RESCHEDULE"
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  reason?: string | null
  requestedDate: string
  proposedDate?: string | null
  proposedStartTime?: string | null
  proposedEndTime?: string | null
  reviewNote?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
  createdAt: string
  updatedAt: string
  liveSchedule?: {
    id: string
    liveClassId: string
    weekday: number
    startTime: string
    endTime: string
    liveClass?: {
      classId: string
    }
  }
  requester?: {
    id: string
    displayName: string
    email: string
  }
  reviewer?: {
    id: string
    displayName: string
    email: string
  }
}

export const academyLiveScheduleRequestsApi = {
  async findAll(params: AcademyLiveScheduleRequestQueryDTO) {
    const res = await apiClient.get<
      StandardApiResponse<{ items: AcademyLiveScheduleRequest[] }>
    >("/api/academy/live-schedules/requests/list", { params })
    return res.data.data!.items
  },

  async create(input: AcademyLiveScheduleRequestCreateDTO) {
    const res = await apiClient.post<
      StandardApiResponse<{ item: AcademyLiveScheduleRequest }>
    >("/api/academy/live-schedules/requests", input)
    return res.data.data!.item
  },

  async cancel(id: string) {
    const res = await apiClient.post<
      StandardApiResponse<{ item: AcademyLiveScheduleRequest }>
    >(`/api/academy/live-schedules/requests/${id}/cancel`)
    return res.data.data!.item
  },

  async approve(id: string, input: AcademyLiveScheduleRequestApproveDTO) {
    const res = await apiClient.post<
      StandardApiResponse<{ item: AcademyLiveScheduleRequest }>
    >(`/api/academy/live-schedules/requests/${id}/approve`, input)
    return res.data.data!.item
  },

  async reject(id: string, input: AcademyLiveScheduleRequestRejectDTO) {
    const res = await apiClient.post<
      StandardApiResponse<{ item: AcademyLiveScheduleRequest }>
    >(`/api/academy/live-schedules/requests/${id}/reject`, input)
    return res.data.data!.item
  },
}

export function useAcademyLiveScheduleRequests(
  params: AcademyLiveScheduleRequestQueryDTO,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["academy-live-schedule-requests", params],
    queryFn: () => academyLiveScheduleRequestsApi.findAll(params),
    enabled: options?.enabled ?? true,
  })
}

export function useCreateAcademyLiveScheduleRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyLiveScheduleRequestsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academy-live-schedule-requests"] })
    },
  })
}

export function useCancelAcademyLiveScheduleRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyLiveScheduleRequestsApi.cancel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academy-live-schedule-requests"] })
    },
  })
}

export function useApproveAcademyLiveScheduleRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AcademyLiveScheduleRequestApproveDTO }) =>
      academyLiveScheduleRequestsApi.approve(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academy-live-schedule-requests"] })
      qc.invalidateQueries({ queryKey: ["academy-live-schedules"] })
    },
  })
}

export function useRejectAcademyLiveScheduleRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AcademyLiveScheduleRequestRejectDTO }) =>
      academyLiveScheduleRequestsApi.reject(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academy-live-schedule-requests"] })
    },
  })
}
