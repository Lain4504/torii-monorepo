import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import { apiClient } from "../api-client"
import type {
    AcademyExamCreateDTO,
    AcademyExamQueryDTO,
    AcademyExamUpdateDTO,
    AcademyExamAttemptStartDTO,
    AcademyExamAttemptSaveAnswersDTO,
    AcademyExamAttemptSubmitDTO,
    AcademyExamAttemptQueryDTO,
    AcademyExamAttemptModel,
    StandardApiResponse,
} from "@workspace/schemas"

export type AcademyExam = {
    id: string
    courseProfileId?: string | null
    title: string
    description?: string | null
    examType: string
    level?: string | null
    totalTimeLimitMinutes?: number | null
    status?: string | null
    settings?: unknown | null
    sections?: any[]
    createdAt: string
    updatedAt: string
}

export const academyExamsApi = {
    /**
     * Get exams with optional search/filter
     */
    async findAll(params: AcademyExamQueryDTO) {
        const res = await apiClient.get<StandardApiResponse<{ items: AcademyExam[] }>>(
            "/api/academy/exams",
            { params },
        )
        return res.data.data!.items
    },

    /**
     * Get exam detail by ID
     */
    async findById(id: string) {
        const res = await apiClient.get<StandardApiResponse<{ item: AcademyExam }>>(
            `/api/academy/exams/${id}`,
        )
        return res.data.data!.item
    },

    /**
     * Start an exam attempt
     */
    async startAttempt(dto: AcademyExamAttemptStartDTO) {
        const res = await apiClient.post<StandardApiResponse<{ item: AcademyExamAttemptModel }>>(
            "/api/academy/exam-attempts/start",
            dto,
        )
        return res.data.data!.item
    },

    /**
     * Save attempt answers
     */
    async saveAnswers(dto: AcademyExamAttemptSaveAnswersDTO) {
        const res = await apiClient.post<StandardApiResponse<{ item: AcademyExamAttemptModel }>>(
            "/api/academy/exam-attempts/save-answers",
            dto,
        )
        return res.data.data!.item
    },

    /**
     * Submit attempt for grading
     */
    async submitAttempt(dto: AcademyExamAttemptSubmitDTO) {
        const res = await apiClient.post<StandardApiResponse<{ item: AcademyExamAttemptModel }>>(
            "/api/academy/exam-attempts/submit",
            dto,
        )
        return res.data.data!.item
    },

    /**
     * Get user attempts
     */
    async findAttempts(params: AcademyExamAttemptQueryDTO) {
        const res = await apiClient.get<StandardApiResponse<{ items: AcademyExamAttemptModel[] }>>(
            "/api/academy/exam-attempts",
            { params },
        )
        return res.data.data!.items
    },

    /**
     * Get attempt details
     */
    async findAttemptById(id: string) {
        const res = await apiClient.get<StandardApiResponse<{ item: AcademyExamAttemptModel }>>(
            `/api/academy/exam-attempts/${id}`,
        )
        return res.data.data!.item
    },
}

// Hooks
export function useAcademyExams(params: AcademyExamQueryDTO, options?: Omit<UseQueryOptions<AcademyExam[]>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: ["academy-exams", params],
        queryFn: () => academyExamsApi.findAll(params),
        ...options,
    })
}

export function useAcademyExam(id?: string) {
    return useQuery({
        enabled: !!id,
        queryKey: ["academy-exam", id],
        queryFn: () => academyExamsApi.findById(id!),
    })
}

export function useStartAcademyExamAttempt() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: academyExamsApi.startAttempt,
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ["academy-exam-attempts"] })
        },
    })
}

export function useSaveAcademyExamAnswers() {
    return useMutation({
        mutationFn: academyExamsApi.saveAnswers,
    })
}

export function useSubmitAcademyExamAttempt() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: academyExamsApi.submitAttempt,
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ["academy-exam-attempts"] })
            qc.invalidateQueries({ queryKey: ["academy-exam-attempt", data.id] })
        },
    })
}

export function useAcademyExamAttempts(params: AcademyExamAttemptQueryDTO) {
    return useQuery({
        queryKey: ["academy-exam-attempts", params],
        queryFn: () => academyExamsApi.findAttempts(params),
    })
}

export function useAcademyExamAttempt(id?: string) {
    return useQuery({
        enabled: !!id,
        queryKey: ["academy-exam-attempt", id],
        queryFn: () => academyExamsApi.findAttemptById(id!),
    })
}
