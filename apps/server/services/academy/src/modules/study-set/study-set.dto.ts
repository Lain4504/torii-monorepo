import { z } from 'zod';

export const createStudySetSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isPublic: z.boolean().optional(),
    color: z.string().optional(),
});
export type CreateStudySetDto = z.infer<typeof createStudySetSchema>;

export const updateStudySetSchema = createStudySetSchema.partial();
export type UpdateStudySetDto = z.infer<typeof updateStudySetSchema>;

export const createSetCardSchema = z.object({
    front: z.string().min(1),
    back: z.string().min(1),
    frontAudio: z.string().optional(),
    backAudio: z.string().optional(),
    frontImage: z.string().optional(),
    backImage: z.string().optional(),
    hint: z.string().optional(),
});
export type CreateSetCardDto = z.infer<typeof createSetCardSchema>;

export const updateSetCardSchema = createSetCardSchema.partial();
export type UpdateSetCardDto = z.infer<typeof updateSetCardSchema>;

export const reviewSetCardSchema = z.object({
    rating: z.enum(['KNOW', 'DONT_KNOW']),
});
export type ReviewSetCardDto = z.infer<typeof reviewSetCardSchema>;
