import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import { apiClient } from "../api-client"
import type {
    AcademyStudyNoteCreateDTO as CreateStudyNoteDto,
    AcademyStudyNoteUpdateDTO as UpdateStudyNoteDto,
    AcademyStudyNoteModel as StudyNoteModel,
    StandardApiResponse,
} from "@workspace/schemas"

export const studyNoteApi = {
    async create(payload: CreateStudyNoteDto) {
        const res = await apiClient.post<StandardApiResponse<{ item: StudyNoteModel }>>(
            "/api/academy/study-notes",
            payload,
        )
        return res.data.data!.item
    },

    async findAll(lessonId?: string) {
        const res = await apiClient.get<StandardApiResponse<{ items: StudyNoteModel[] }>>(
            "/api/academy/study-notes",
            { params: { lessonId } },
        )
        return res.data.data!.items
    },

    async findById(id: string) {
        const res = await apiClient.get<StandardApiResponse<{ item: StudyNoteModel }>>(
            `/api/academy/study-notes/${id}`,
        )
        return res.data.data!.item
    },

    async update(id: string, payload: UpdateStudyNoteDto) {
        const res = await apiClient.patch<StandardApiResponse<{ item: StudyNoteModel }>>(
            `/api/academy/study-notes/${id}`,
            payload,
        )
        return res.data.data!.item
    },

    async delete(id: string) {
        const res = await apiClient.delete<StandardApiResponse<{ result: boolean }>>(
            `/api/academy/study-notes/${id}`,
        )
        return res.data.data!.result
    },
}

// Hooks
export function useStudyNotes(lessonId?: string, options?: Omit<UseQueryOptions<StudyNoteModel[]>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: ["study-notes", lessonId],
        queryFn: () => studyNoteApi.findAll(lessonId),
        ...options,
    })
}

export function useStudyNote(id?: string, options?: Omit<UseQueryOptions<StudyNoteModel>, "queryKey" | "queryFn">) {
    return useQuery({
        enabled: !!id,
        queryKey: ["study-note", id],
        queryFn: () => studyNoteApi.findById(id!),
        ...options,
    })
}

export function useCreateStudyNote() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: studyNoteApi.create,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["study-notes"] })
        },
    })
}

export function useUpdateStudyNote() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateStudyNoteDto }) =>
            studyNoteApi.update(id, payload),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ["study-notes"] })
            qc.invalidateQueries({ queryKey: ["study-note", data.id] })
        },
    })
}

export function useDeleteStudyNote() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: studyNoteApi.delete,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["study-notes"] })
        },
    })
}
