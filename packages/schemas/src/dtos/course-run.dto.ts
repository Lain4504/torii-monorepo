import { z } from 'zod';
import { courseRunSchema } from '../models/course-run.model';
import { paginationOptionsDTOSchema } from './common.dto';

export const courseRunCreateDTOSchema = courseRunSchema.pick({
    courseId: true,
    title: true,
    lecturerId: true,
    startDate: true,
    endDate: true,
    enrollmentStart: true,
    enrollmentEnd: true,
    maxStudents: true,
    minStudents: true,
    price: true,
    discountPrice: true,
    status: true,
}).extend({
    versionId: z.string().uuid().optional().nullable(),
});

export type CourseRunCreateDTO = z.infer<typeof courseRunCreateDTOSchema>;

export const courseRunUpdateDTOSchema = courseRunCreateDTOSchema.extend({
    status: courseRunSchema.shape.status.optional(),
}).partial();

export type CourseRunUpdateDTO = z.infer<typeof courseRunUpdateDTOSchema>;

export const courseRunResponseDTOSchema = courseRunSchema.extend({
    lecturer: z.object({
        id: z.string().uuid(),
        displayName: z.string(),
        avatarUrl: z.string().optional().nullable(),
    }).optional().nullable(),
    totalEnrolled: z.number().int().default(0),
});

export type CourseRunResponseDTO = z.infer<typeof courseRunResponseDTOSchema>;

export const courseRunSearchRequestDTOSchema = paginationOptionsDTOSchema.extend({
    courseId: z.string().uuid().optional(),
    status: courseRunSchema.shape.status.optional(),
});

export type CourseRunSearchRequestDTO = z.infer<typeof courseRunSearchRequestDTOSchema>;
