import { z } from 'zod';
import { lessonSchema, LessonContentType } from '../models/lesson.model';

export const lessonCreateDTOSchema = lessonSchema
    .pick({
        moduleId: true,
        title: true,
        contentType: true,
        videoUrl: true,
        videoDuration: true,
        durationMinutes: true,
        articleContent: true,
        isPreview: true,
        isUnlocked: true,
        status: true,
        createdBy: true,
    })
    .extend({
        status: z.enum(['published', 'draft']),
    });

export type LessonCreateDTO = z.infer<typeof lessonCreateDTOSchema>;

export const lessonUpdateDTOSchema = lessonSchema
    .pick({
        moduleId: true,
        title: true,
        contentType: true,
        videoUrl: true,
        videoDuration: true,
        durationMinutes: true,
        articleContent: true,
        isPreview: true,
        isUnlocked: true,
        status: true,
    })
    .extend({
        updatedBy: z.string().uuid().optional(),
    })
    .partial();

export type LessonUpdateDTO = z.infer<typeof lessonUpdateDTOSchema>;

export const lessonQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
    moduleId: z.string().uuid().optional(),
    contentType: z.nativeEnum(LessonContentType).optional(),
    search: z.string().optional(),
    status: z.enum(['published', 'draft']).optional(),
});

export type LessonQueryDTO = z.infer<typeof lessonQueryDTOSchema>;

export const lessonSearchRequestDTOSchema = lessonQueryDTOSchema;
export type LessonSearchRequestDTO = z.infer<typeof lessonSearchRequestDTOSchema>;

export const lessonResponseDTOSchema = lessonSchema;

export type LessonResponseDTO = z.infer<typeof lessonResponseDTOSchema>;
