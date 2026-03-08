import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import { apiClient } from "../api-client"
import type {
  AcademyAssignmentTemplateQueryDTO,
  AcademyAssignmentTemplateModel,
  AcademyAssignmentSubmissionCreateDTO,
  AcademyAssignmentSubmissionUpdateDTO,
  AcademyAssignmentSubmissionQueryDTO,
  AcademyAssignmentSubmissionModel,
  StandardApiResponse,
} from "@workspace/schemas"

export const academyAssignmentApi = {
  /**
   * Get assignment templates with filtering
   */
  async findTemplates(params: AcademyAssignmentTemplateQueryDTO) {
    const res = await apiClient.get<StandardApiResponse<{ items: AcademyAssignmentTemplateModel[] }>>(
      "/api/academy/assignment-templates",
      { params },
    )
    return res.data.data!.items
  },

  /**
   * Get template by ID
   */
  async findTemplateById(id: string) {
    const res = await apiClient.get<StandardApiResponse<{ item: AcademyAssignmentTemplateModel }>>(
      `/api/academy/assignment-templates/${id}`,
    )
    return res.data.data!.item
  },

  /**
   * Get user submissions with filtering
   */
  async findSubmissions(params: AcademyAssignmentSubmissionQueryDTO) {
    const res = await apiClient.get<StandardApiResponse<{ items: AcademyAssignmentSubmissionModel[] }>>(
      "/api/academy/assignment-submissions",
      { params },
    )
    return res.data.data!.items
  },

  /**
   * Get submission by ID
   */
  async findSubmissionById(id: string) {
    const res = await apiClient.get<StandardApiResponse<{ item: AcademyAssignmentSubmissionModel }>>(
      `/api/academy/assignment-submissions/${id}`,
    )
    return res.data.data!.item
  },

  /**
   * Create (Submit) a new assignment submission
   */
  async createSubmission(dto: AcademyAssignmentSubmissionCreateDTO) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyAssignmentSubmissionModel }>>(
      "/api/academy/assignment-submissions",
      dto,
    )
    return res.data.data!.item
  },

  /**
   * Update (Save Draft / Resubmit) a submission
   */
  async updateSubmission(id: string, dto: AcademyAssignmentSubmissionUpdateDTO) {
    const res = await apiClient.put<StandardApiResponse<{ item: AcademyAssignmentSubmissionModel }>>(
      `/api/academy/assignment-submissions/${id}`,
      dto,
    )
    return res.data.data!.item
  },
}

// Hooks
export function useAcademyAssignmentTemplates(
  params: AcademyAssignmentTemplateQueryDTO,
  options?: Omit<UseQueryOptions<AcademyAssignmentTemplateModel[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["academy-assignment-templates", params],
    queryFn: () => academyAssignmentApi.findTemplates(params),
    ...options,
  })
}

export function useAcademyAssignmentTemplate(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["academy-assignment-template", id],
    queryFn: () => academyAssignmentApi.findTemplateById(id!),
  })
}

export function useAcademyAssignmentSubmissions(
  params: AcademyAssignmentSubmissionQueryDTO,
  options?: Omit<UseQueryOptions<AcademyAssignmentSubmissionModel[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["academy-assignment-submissions", params],
    queryFn: () => academyAssignmentApi.findSubmissions(params),
    ...options,
  })
}

export function useAcademyAssignmentSubmission(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["academy-assignment-submission", id],
    queryFn: () => academyAssignmentApi.findSubmissionById(id!),
  })
}

export function useCreateAcademyAssignmentSubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyAssignmentApi.createSubmission,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academy-assignment-submissions"] })
    },
  })
}

export function useUpdateAcademyAssignmentSubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AcademyAssignmentSubmissionUpdateDTO }) =>
      academyAssignmentApi.updateSubmission(id, dto),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["academy-assignment-submissions"] })
      qc.invalidateQueries({ queryKey: ["academy-assignment-submission", data.id] })
    },
  })
}
