import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type {
  AcademyClassScheduleCreateDTO,
  AcademyClassScheduleQueryDTO,
  AcademyClassScheduleUpdateDTO,
  StandardApiResponse,
} from "@workspace/schemas"

export type AcademyClassSchedule = {
  id: string
  classId: string
  weekday: number
  startTime: string
  endTime: string
  location?: string | null
  note?: string | null
}

export const academyClassSchedulesApi = {
  async findAll(params: AcademyClassScheduleQueryDTO) {
    const res = await apiClient.get<
      StandardApiResponse<{ items: AcademyClassSchedule[] }>
    >("/api/academy/class-schedules", {
      params,
    })
    return res.data.data!.items
  },

  async findById(id: string) {
    const res = await apiClient.get<
      StandardApiResponse<{ item: AcademyClassSchedule }>
    >(`/api/academy/class-schedules/${id}`)
    return res.data.data!.item
  },

  async create(input: AcademyClassScheduleCreateDTO) {
    const res = await apiClient.post<
      StandardApiResponse<{ item: AcademyClassSchedule }>
    >("/api/academy/class-schedules", input)
    return res.data.data!.item
  },

  async update(id: string, input: AcademyClassScheduleUpdateDTO) {
    const res = await apiClient.put<
      StandardApiResponse<{ item: AcademyClassSchedule }>
    >(`/api/academy/class-schedules/${id}`, input)
    return res.data.data!.item
  },

  async delete(id: string) {
    const res = await apiClient.delete<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/class-schedules/${id}`,
    )
    return res.data
  },
}

export function useAcademyClassSchedules(
  params: AcademyClassScheduleQueryDTO,
) {
  return useQuery({
    queryKey: ["academy-class-schedules", params],
    queryFn: () => academyClassSchedulesApi.findAll(params),
  })
}

export function useAcademyClassSchedule(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["academy-class-schedule", id],
    queryFn: () => academyClassSchedulesApi.findById(id!),
  })
}

export function useCreateAcademyClassSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyClassSchedulesApi.create,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["academy-class-schedules"] }),
  })
}

export function useUpdateAcademyClassSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: AcademyClassScheduleUpdateDTO
    }) => academyClassSchedulesApi.update(id, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["academy-class-schedules"] }),
  })
}

export function useDeleteAcademyClassSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyClassSchedulesApi.delete(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["academy-class-schedules"] }),
  })
}

