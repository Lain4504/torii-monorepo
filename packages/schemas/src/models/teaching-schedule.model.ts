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

export const teachingScheduleResponseDTOSchema = teachingScheduleSchema;

export type TeachingScheduleResponseDTO = z.infer<typeof teachingScheduleResponseDTOSchema>;

// ============================================================================
// Schedule Request
// ============================================================================

export const scheduleRequestSchema = z.object({
    id: z.string(),
    liveSessionId: z.string(),
    reason: z.string().optional(),
    newTime: z.string(),
    status: z.enum(['pending', 'approved', 'rejected']),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const scheduleRequestCreateDTOSchema = scheduleRequestSchema.pick({
    liveSessionId: true,
    reason: true,
    newTime: true,
});

export type ScheduleRequestCreateDTO = z.infer<typeof scheduleRequestCreateDTOSchema>;

export const scheduleRequestResponseDTOSchema = scheduleRequestSchema;

export type ScheduleRequestResponseDTO = z.infer<typeof scheduleRequestResponseDTOSchema>;
