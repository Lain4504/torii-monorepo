import { z } from "zod"

export const academyStudySetCreateDTOSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isPublic: z.boolean().optional(),
    settings: z.record(z.any()).optional(),
})
export type AcademyStudySetCreateDTO = z.infer<typeof academyStudySetCreateDTOSchema>

export const academyStudySetUpdateDTOSchema = academyStudySetCreateDTOSchema.partial()
export type AcademyStudySetUpdateDTO = z.infer<typeof academyStudySetUpdateDTOSchema>

export const academySetCardCreateDTOSchema = z.object({
    term: z.string().min(1),
    definition: z.string().min(1),
    hint: z.string().optional(),
    mediaUrl: z.string().optional(),
    tags: z.array(z.string()).optional(),
})
export type AcademySetCardCreateDTO = z.infer<typeof academySetCardCreateDTOSchema>

export const academySetCardUpdateDTOSchema = academySetCardCreateDTOSchema.partial()
export type AcademySetCardUpdateDTO = z.infer<typeof academySetCardUpdateDTOSchema>

export const academySetCardReviewDTOSchema = z.object({
    quality: z.number().int().min(0).max(1),
})
export type AcademySetCardReviewDTO = z.infer<typeof academySetCardReviewDTOSchema>

export type AcademyStudySetModel = {
    id: string
    userId: string
    title: string
    description?: string | null
    tags: string[]
    isPublic: boolean
    settings?: Record<string, any> | null
    createdAt: string
    updatedAt: string
    _count?: {
        setCards: number
    }
}

export type AcademySetCardModel = {
    id: string
    studySetId: string
    term: string
    definition: string
    hint?: string | null
    mediaUrl?: string | null
    tags: string[]
    srsState: string
    interval: number
    nextReviewAt: string
    createdAt: string
    updatedAt: string
}
