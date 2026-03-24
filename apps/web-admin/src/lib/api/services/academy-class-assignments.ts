import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type {
  AcademyLiveClassAssignmentCreateDTO,
  AcademyLiveClassAssignmentUpdateDTO,
  StandardApiResponse,
} from "@workspace/schemas"

export type AcademyAssignment = {
  id: string
  title: string
  instructions: string
  createdAt: string
  updatedAt: string
}

export type AcademyClassAssignment = {
  id: string
  classId: string
  assignmentId: string
  titleOverride?: string | null
  openAt?: string | null
  deadline?: string | null
  createdAt: string
  updatedAt: string
  assignment?: AcademyAssignment
  _count?: { submissions: number }
}

export const academyClassAssignmentsApi = {
  async findById(id: string) {
    const res = await apiClient.get<
      StandardApiResponse<{ item: AcademyClassAssignment }>
    >(`/api/academy/live-class-assignments/${id}`)
    return res.data.data!.item
  },

  async findByClassId(classId: string) {
    const res = await apiClient.get<
      StandardApiResponse<{ items: AcademyClassAssignment[] }>
    >(`/api/academy/live-classes/${classId}/assignments`)
    return res.data.data!.items
  },

  async add(classId: string, input: Omit<AcademyLiveClassAssignmentCreateDTO, "classId">) {
    const res = await apiClient.post<
      StandardApiResponse<{ item: AcademyClassAssignment }>
    >(`/api/academy/live-classes/${classId}/assignments`, { ...input, classId })
    return res.data.data!.item
  },

  async update(id: string, input: AcademyLiveClassAssignmentUpdateDTO) {
    const res = await apiClient.put<
      StandardApiResponse<{ item: AcademyClassAssignment }>
    >(`/api/academy/live-class-assignments/${id}`, input)
    return res.data.data!.item
  },

  async remove(id: string) {
    const res = await apiClient.delete<StandardApiResponse<{ ok: boolean }>>(
      `/api/academy/live-class-assignments/${id}`,
    )
    return res.data
  },
}

export function useAcademyClassAssignment(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ["academy-class-assignment", id],
    queryFn: () => academyClassAssignmentsApi.findById(id!),
  })
}

export function useAcademyClassAssignments(classId: string) {
  return useQuery({
    enabled: !!classId,
    queryKey: ["academy-class-assignments", classId],
    queryFn: () => academyClassAssignmentsApi.findByClassId(classId),
  })
}

export function useAddAcademyClassAssignment(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<AcademyLiveClassAssignmentCreateDTO, "classId">) =>
      academyClassAssignmentsApi.add(classId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-class-assignments", classId] }),
  })
}

export function useUpdateAcademyClassAssignment(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: AcademyLiveClassAssignmentUpdateDTO
    }) => academyClassAssignmentsApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-class-assignments", classId] }),
  })
}

export function useRemoveAcademyClassAssignment(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyClassAssignmentsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academy-class-assignments", classId] }),
  })
}
