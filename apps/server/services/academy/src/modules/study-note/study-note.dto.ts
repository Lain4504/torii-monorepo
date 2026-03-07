import { z } from 'zod';

export const createStudyNoteSchema = z.object({
    content: z.string(),
    lessonId: z.string().uuid().optional(),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
});

export type CreateStudyNoteDto = z.infer<typeof createStudyNoteSchema>;

export const updateStudyNoteSchema = createStudyNoteSchema.partial();

export type UpdateStudyNoteDto = z.infer<typeof updateStudyNoteSchema>;
