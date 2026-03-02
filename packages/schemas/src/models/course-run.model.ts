import { z } from 'zod';
import { CourseRunStatus } from '../enums/course-run.enum';

export const courseRunSchema = z.object({
    id: z.string().uuid(),
    courseMasterId: z.string().uuid(),
    versionId: z.string().uuid().optional().nullable(),
    title: z.string().min(1),
    slug: z.string(),
    lecturerId: z.string().uuid().optional().nullable(),
    startDate: z.coerce.date().optional().nullable(),
    endDate: z.coerce.date().optional().nullable(),
    enrollmentStart: z.coerce.date().optional().nullable(),
    enrollmentEnd: z.coerce.date().optional().nullable(),
    maxStudents: z.number().int().min(1).optional().nullable(),
    minStudents: z.number().int().min(1).default(1),
    price: z.number().min(0).optional().nullable(),
    discountPrice: z.number().min(0).optional().nullable(),
    coverUrl: z.string().optional().nullable(),
    previewVideoUrl: z.string().optional().nullable(),
    liveConfig: z.record(z.any()).optional().nullable(),
    status: z.nativeEnum(CourseRunStatus).default(CourseRunStatus.PLANNING),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type CourseRun = z.infer<typeof courseRunSchema>;
