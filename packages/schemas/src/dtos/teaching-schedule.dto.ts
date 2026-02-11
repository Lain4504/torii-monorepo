import { z } from 'zod';

export const teachingScheduleCreateDTOSchema = z.object({
    courseId: z.string().uuid(),
    lecturerId: z.string().uuid(),
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
    duration: z.number().min(15).default(90),
});

export type TeachingScheduleCreateDTO = z.infer<typeof teachingScheduleCreateDTOSchema>;

export const scheduleRequestCreateDTOSchema = z.object({
    lecturerId: z.string().uuid(),
    originalScheduleId: z.string().uuid().optional(),
    courseId: z.string().uuid(),
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
    duration: z.number().min(15).default(90),
    reason: z.string().optional(),
});

export type ScheduleRequestCreateDTO = z.infer<typeof scheduleRequestCreateDTOSchema>;

export interface TeachingScheduleResponseDTO {
    id: string;
    courseId: string;
    lecturerId: string;
    dayOfWeek: number;
    startTime: string;
    duration: number;
    createdAt: Date;
    updatedAt: Date;

    course?: {
        id: string;
        title: string;
    };
    lecturer?: {
        id: string;
        displayName: string;
    };
}

export interface ScheduleRequestResponseDTO {
    id: string;
    lecturerId: string;
    originalScheduleId: string | null;
    courseId: string;
    dayOfWeek: number;
    startTime: string;
    duration: number;
    reason: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;

    lecturer?: {
        id: string;
        displayName: string;
    };
    course?: {
        id: string;
        title: string;
    };
}
