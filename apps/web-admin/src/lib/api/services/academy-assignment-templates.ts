import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type {
    AcademyAssignmentTemplateCreateDTO,
    AcademyAssignmentTemplateQueryDTO,
    AcademyAssignmentTemplateUpdateDTO,
    StandardApiResponse,
} from "@workspace/schemas"

export type AcademyAssignmentTemplate = {
    id: string
    courseProfileId: string
    title: string
    description?: string
    defaultType: 'TEXT' | 'FILE' | 'BOTH'
    defaultMaxScore?: number
    defaultRubric?: any
    defaultSubmissionSettings?: any
    createdAt: string
    updatedAt: string
}

export const academyAssignmentTemplatesApi = {
    async findAll(params: AcademyAssignmentTemplateQueryDTO) {
        const res = await apiClient.get<
            StandardApiResponse<{ items: AcademyAssignmentTemplate[] }>
        >("/api/academy/assignment-templates", {
            params,
        })
        return res.data.data!.items
    },

    async findById(id: string) {
        const res = await apiClient.get<
            StandardApiResponse<{ item: AcademyAssignmentTemplate }>
        >(`/api/academy/assignment-templates/${id}`)
        return res.data.data!.item
    },

    async create(input: AcademyAssignmentTemplateCreateDTO) {
        const res = await apiClient.post<
            StandardApiResponse<{ item: AcademyAssignmentTemplate }>
        >("/api/academy/assignment-templates", input)
        return res.data.data!.item
    },

    async update(id: string, input: AcademyAssignmentTemplateUpdateDTO) {
        const res = await apiClient.put<
            StandardApiResponse<{ item: AcademyAssignmentTemplate }>
        >(`/api/academy/assignment-templates/${id}`, input)
        return res.data.data!.item
    },

    async delete(id: string) {
        const res = await apiClient.delete<StandardApiResponse<{ ok: boolean }>>(
            `/api/academy/assignment-templates/${id}`,
        )
        return res.data
    },
}

export function useAcademyAssignmentTemplates(
    params: AcademyAssignmentTemplateQueryDTO,
) {
    return useQuery({
        queryKey: ["academy-assignment-templates", params],
        queryFn: () => academyAssignmentTemplatesApi.findAll(params),
    })
}

export function useAcademyAssignmentTemplate(id?: string) {
    return useQuery({
        enabled: !!id,
        queryKey: ["academy-assignment-template", id],
        queryFn: () => academyAssignmentTemplatesApi.findById(id!),
    })
}

export function useCreateAcademyAssignmentTemplate() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: academyAssignmentTemplatesApi.create,
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["academy-assignment-templates"] }),
    })
}

export function useUpdateAcademyAssignmentTemplate() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            input,
        }: {
            id: string
            input: AcademyAssignmentTemplateUpdateDTO
        }) => academyAssignmentTemplatesApi.update(id, input),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["academy-assignment-templates"] }),
    })
}

export function useDeleteAcademyAssignmentTemplate() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => academyAssignmentTemplatesApi.delete(id),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["academy-assignment-templates"] }),
    })
}
