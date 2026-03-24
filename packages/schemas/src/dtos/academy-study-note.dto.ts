import { z } from "zod"

export const academyStudyNoteCreateDTOSchema = z.object({
    content: z.string().min(1),
    lessonId: z.string().uuid().optional(),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
})
export type AcademyStudyNoteCreateDTO = z.infer<typeof academyStudyNoteCreateDTOSchema>

export const academyStudyNoteUpdateDTOSchema = academyStudyNoteCreateDTOSchema.partial()
export type AcademyStudyNoteUpdateDTO = z.infer<typeof academyStudyNoteUpdateDTOSchema>

export const academyStudyNoteShareDTOSchema = z.object({
    isPublic: z.boolean(),
})
export type AcademyStudyNoteShareDTO = z.infer<typeof academyStudyNoteShareDTOSchema>

export type AcademyStudyNoteModel = {
    id: string
    userId: string
    lessonId?: string | null
    content: string
    tags: string[]
    metadata?: Record<string, any> | null
    createdAt: string
    updatedAt: string
}

export type AcademyPublicStudyNoteModel = {
    id: string
    content: string
    tags: string[]
    createdAt: string
    updatedAt: string
}
