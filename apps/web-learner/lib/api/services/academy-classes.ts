import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type {
  AcademyClassQueryDTO,
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
