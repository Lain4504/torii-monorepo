import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "../api-client"
import type {
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

export type AcademyAssignmentSubmission = {
  id: string
  classId?: string
  classAssessmentId?: string
  assignmentTemplateId?: string
  userId: string
  status: string
  score?: number | null
  grade?: number | string | null
  submittedAt?: string | null
  gradedAt?: string | null
  content?: any
  fileUrls?: string[]
  feedback?: string | null
  createdAt: string
  updatedAt: string
}

export const academyAssignmentApi = {
  /**
   * Get all assignments for a specific class
   */
  async findAssignmentsByClassId(classId: string) {
    const res = await apiClient.get<
      StandardApiResponse<{ items: AcademyClassAssignment[] }>
    >(`/api/academy/live-classes/${classId}/assignments`)
    return res.data.data!.items
  },

  /**
   * Get my submissions for a specific class
   */
  async findMySubmissions(classId: string) {
    const res = await apiClient.get<
      StandardApiResponse<{ items: AcademyAssignmentSubmission[] }>
    >("/api/academy/assignment-submissions", {
      params: { classId },
    })
    return res.data.data!.items
  },

  /**
   * Create a new submission
   */
  async submitAssignment(input: {
    classId: string
    classAssessmentId: string
    assignmentTemplateId: string
    content: any
    fileUrls?: string[]
  }) {
    const res = await apiClient.post<
      StandardApiResponse<{ item: AcademyAssignmentSubmission }>
    >("/api/academy/assignment-submissions", input)
    return res.data.data!.item
  }
}

export function useAcademyClassAssignments(classId: string) {
  return useQuery({
    enabled: !!classId,
    queryKey: ["academy-class-assignments", classId],
    queryFn: () => academyAssignmentApi.findAssignmentsByClassId(classId),
  })
}

export function useMyAssignmentSubmissions(classId: string) {
  return useQuery({
    enabled: !!classId,
    queryKey: ["academy-my-submissions", classId],
    queryFn: () => academyAssignmentApi.findMySubmissions(classId),
  })
}

export function useSubmitAssignment(classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      classAssessmentId: string
      assignmentTemplateId: string
      content: any
    }) => academyAssignmentApi.submitAssignment({ ...input, classId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academy-my-submissions", classId] })
      qc.invalidateQueries({ queryKey: ["academy-class-assignments", classId] })
    },
  })
}
