import { z } from 'zod';

// ============================================================================
// Teaching Schedule
// ============================================================================
export const teachingScheduleSchema = z.object({
    id: z.string(),
    courseId: z.string(),
    lecturerId: z.string(),
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    duration: z.number().positive(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type TeachingSchedule = z.infer<typeof teachingScheduleSchema>;

export const teachingScheduleCreateDTOSchema = teachingScheduleSchema.pick({
    courseId: true,
    lecturerId: true,
    dayOfWeek: true,
    startTime: true,
    duration: true,
});

export type TeachingScheduleCreateDTO = z.infer<typeof teachingScheduleCreateDTOSchema>;

export const teachingScheduleResponseDTOSchema = teachingScheduleSchema.extend({
    course: z.object({
        id: z.string(),
        title: z.string(),
    }).optional(),
    lecturer: z.object({
        id: z.string(),
        displayName: z.string(),
    }).optional(),
});

export type TeachingScheduleResponseDTO = z.infer<typeof teachingScheduleResponseDTOSchema>;

// ============================================================================
// Schedule Request
// ============================================================================

export const scheduleRequestSchema = z.object({
    id: z.string(),
    lecturerId: z.string().uuid(),
    originalScheduleId: z.string().uuid().optional().nullable(),
    courseId: z.string().uuid(),
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    duration: z.number().min(15),
    reason: z.string().optional().nullable(),
    status: z.enum(['pending', 'approved', 'rejected']),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const scheduleRequestCreateDTOSchema = scheduleRequestSchema.pick({
    lecturerId: true,
    originalScheduleId: true,
    courseId: true,
    dayOfWeek: true,
    startTime: true,
    duration: true,
    reason: true,
}).extend({
    liveSessionId: z.string().uuid().optional(),
    newTime: z.string().optional(),
});

export type ScheduleRequestCreateDTO = z.infer<typeof scheduleRequestCreateDTOSchema>;

export const scheduleRequestResponseDTOSchema = scheduleRequestSchema.extend({
    lecturer: z.object({
        id: z.string(),
        displayName: z.string(),
    }).optional(),
    course: z.object({
        id: z.string(),
        title: z.string(),
    }).optional(),
});

export type ScheduleRequestResponseDTO = z.infer<typeof scheduleRequestResponseDTOSchema>;
