import { z } from 'zod';

export const createStudySetSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    isPublic: z.boolean().optional(),
    settings: z.record(z.any()).optional(),
});
export type CreateStudySetDto = z.infer<typeof createStudySetSchema>;

export const updateStudySetSchema = createStudySetSchema.partial();
export type UpdateStudySetDto = z.infer<typeof updateStudySetSchema>;

export const createSetCardSchema = z.object({
    term: z.string().min(1),
    definition: z.string().min(1),
    hint: z.string().optional(),
    mediaUrl: z.string().optional(),
    tags: z.array(z.string()).optional(),
});
export type CreateSetCardDto = z.infer<typeof createSetCardSchema>;

export const updateSetCardSchema = createSetCardSchema.partial();
export type UpdateSetCardDto = z.infer<typeof updateSetCardSchema>;

export const reviewSetCardSchema = z.object({
    quality: z.number().int().min(0).max(1),
});
export type ReviewSetCardDto = z.infer<typeof reviewSetCardSchema>;
