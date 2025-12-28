import { z } from 'zod';

export enum LessonContentType {
    VIDEO = 'video',
    ARTICLE = 'article',
    QUIZ = 'quiz',
    ASSIGNMENT = 'assignment',
}

export const lessonSchema = z.object({
    id: z.string().uuid(),
    moduleId: z.string().uuid(),
    title: z.string().min(1),
    contentType: z.nativeEnum(LessonContentType),
    videoUrl: z.string().optional(),
    videoDuration: z.number().optional(),
    articleContent: z.string().optional(),
    order: z.number().optional(),
    isPreview: z.boolean().default(false),
    isUnlocked: z.boolean().default(false),
    createdBy: z.string().uuid().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().optional(),
});

export type Lesson = z.infer<typeof lessonSchema>;
