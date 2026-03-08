import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import { apiClient } from "../api-client"
import type {
    AcademyQuizTemplateCreateDTO,
    AcademyQuizTemplateUpdateDTO,
    AcademyQuizTemplateQueryDTO,
    StandardApiResponse,
} from "@workspace/schemas"

export type AcademyQuizTemplateModel = {
    id: string;
    courseProfileId: string;
    title: string;
    description?: string | null;
    totalQuestions: number;
    timeLimit?: number | null;
    passingScore?: number | null;
    maxAttempts: number;
    settings?: any | null;
    createdAt: string;
    updatedAt: string;
};

export const academyQuizApi = {
    /**
     * Get quiz templates with filtering
     */
    async findTemplates(params: AcademyQuizTemplateQueryDTO) {
        const res = await apiClient.get<StandardApiResponse<{ items: AcademyQuizTemplateModel[] }>>(
            "/api/academy/quiz-templates",
            { params },
        )
        return res.data.data!.items
    },

    /**
     * Get quiz template by ID
     */
    async findTemplateById(id: string) {
        const res = await apiClient.get<StandardApiResponse<{ item: AcademyQuizTemplateModel }>>(
            `/api/academy/quiz-templates/${id}`,
        )
        return res.data.data!.item
    },
}

// Hooks
export function useAcademyQuizTemplates(
    params: AcademyQuizTemplateQueryDTO,
    options?: Omit<UseQueryOptions<AcademyQuizTemplateModel[]>, "queryKey" | "queryFn">
) {
    return useQuery({
        queryKey: ["academy-quiz-templates", params],
        queryFn: () => academyQuizApi.findTemplates(params),
        ...options,
    })
}

export function useAcademyQuizTemplate(id?: string) {
    return useQuery({
        enabled: !!id,
        queryKey: ["academy-quiz-template", id],
        queryFn: () => academyQuizApi.findTemplateById(id!),
    })
}
