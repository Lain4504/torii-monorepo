import { z } from 'zod';

export const courseVersionSchema = z.object({
    id: z.string().uuid(),
    courseId: z.string().uuid(),
    versionTag: z.string(),
    curriculumSnapshot: z.any(), // JSONB containing modules and lessons
    changelog: z.string().optional().nullable(),
    publishedAt: z.date(),
});

export type CourseVersion = z.infer<typeof courseVersionSchema>;
