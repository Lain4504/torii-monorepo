import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type {
    AcademyQuizTemplateCreateDTO,
    AcademyQuizTemplateQueryDTO,
    AcademyQuizTemplateUpdateDTO,
    StandardApiResponse,
} from "@workspace/schemas"

export type AcademyQuizTemplate = {
    id: string
    courseProfileId: string
    title: string
    description?: string
    questionPoolId?: string
    defaultTimeLimitMinutes?: number
    defaultMaxAttempts: number
    defaultPassingScorePercent?: number
    settings?: any
    createdAt: string
    updatedAt: string
}

export const academyQuizTemplatesApi = {
    async findAll(params: AcademyQuizTemplateQueryDTO) {
        const res = await apiClient.get<
            StandardApiResponse<{ items: AcademyQuizTemplate[] }>
        >("/api/academy/quiz-templates", {
            params,
        })
        return res.data.data!.items
    },

    async findById(id: string) {
        const res = await apiClient.get<
            StandardApiResponse<{ item: AcademyQuizTemplate }>
        >(`/api/academy/quiz-templates/${id}`)
        return res.data.data!.item
    },

    async create(input: AcademyQuizTemplateCreateDTO) {
        const res = await apiClient.post<
            StandardApiResponse<{ item: AcademyQuizTemplate }>
        >("/api/academy/quiz-templates", input)
        return res.data.data!.item
    },

    async update(id: string, input: AcademyQuizTemplateUpdateDTO) {
        const res = await apiClient.put<
            StandardApiResponse<{ item: AcademyQuizTemplate }>
        >(`/api/academy/quiz-templates/${id}`, input)
        return res.data.data!.item
    },

    async delete(id: string) {
        const res = await apiClient.delete<StandardApiResponse<{ ok: boolean }>>(
            `/api/academy/quiz-templates/${id}`,
        )
        return res.data
    },
}

export function useAcademyQuizTemplates(
    params: AcademyQuizTemplateQueryDTO,
) {
    return useQuery({
        queryKey: ["academy-quiz-templates", params],
        queryFn: () => academyQuizTemplatesApi.findAll(params),
    })
}

export function useAcademyQuizTemplate(id?: string) {
    return useQuery({
        enabled: !!id,
        queryKey: ["academy-quiz-template", id],
        queryFn: () => academyQuizTemplatesApi.findById(id!),
    })
}

export function useCreateAcademyQuizTemplate() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: academyQuizTemplatesApi.create,
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["academy-quiz-templates"] }),
    })
}

export function useUpdateAcademyQuizTemplate() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            input,
        }: {
            id: string
            input: AcademyQuizTemplateUpdateDTO
        }) => academyQuizTemplatesApi.update(id, input),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["academy-quiz-templates"] }),
    })
}

export function useDeleteAcademyQuizTemplate() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => academyQuizTemplatesApi.delete(id),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["academy-quiz-templates"] }),
    })
}
