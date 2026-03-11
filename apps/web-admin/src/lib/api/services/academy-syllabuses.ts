import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/api-client"
import type { StandardApiResponse } from "@workspace/schemas"

export type AcademySyllabus = {
    id: string
    courseProfileId: string
    versionLabel: string
    name?: string | null
    status: "DRAFT" | "PUBLISHED" | "LOCKED" | "ARCHIVED"
    createdAt: string
    updatedAt: string
    modules?: any[]
    _count?: {
        modules: number
        classes: number
    }
}

export const academySyllabusesApi = {
    async findAll(params: { courseProfileId: string }) {
        const res = await apiClient.get<StandardApiResponse<{ items: AcademySyllabus[] }>>(
            "/api/academy/syllabuses",
            { params },
        )
        return res.data.data!.items
    },

    async findById(id: string) {
        const res = await apiClient.get<StandardApiResponse<{ item: AcademySyllabus }>>(
            `/api/academy/syllabuses/${id}`,
        )
        return res.data.data!.item
    },

    async create(input: { courseProfileId: string; version: string; name?: string }) {
        const res = await apiClient.post<StandardApiResponse<{ item: AcademySyllabus }>>(
            "/api/academy/syllabuses",
            input,
        )
        return res.data.data!.item
    },

    async clone(id: string, input: { newVersion: string; newName?: string }) {
        const res = await apiClient.post<StandardApiResponse<{ item: AcademySyllabus }>>(
            `/api/academy/syllabuses/${id}/clone`,
            input,
        )
        return res.data.data!.item
    },

    async publish(id: string) {
        const res = await apiClient.post<StandardApiResponse<{ item: AcademySyllabus }>>(
            `/api/academy/syllabuses/${id}/publish`,
            {},
        )
        return res.data.data!.item
    },
}

export function useAcademySyllabuses(courseProfileId: string) {
    return useQuery({
        enabled: !!courseProfileId,
        queryKey: ["academy-syllabuses", courseProfileId],
        queryFn: () => academySyllabusesApi.findAll({ courseProfileId }),
    })
}

export function useAcademySyllabus(id?: string) {
    return useQuery({
        enabled: !!id,
        queryKey: ["academy-syllabus", id],
        queryFn: () => academySyllabusesApi.findById(id!),
    })
}

export function useCreateAcademySyllabus() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: academySyllabusesApi.create,
        onSuccess: (_, variables) => qc.invalidateQueries({ queryKey: ["academy-syllabuses", variables.courseProfileId] }),
    })
}
