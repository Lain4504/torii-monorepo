import { z } from 'zod';

export enum LiveSessionStatus {
    SCHEDULED = 'scheduled',
    LIVE = 'live',
    ENDED = 'ended',
    CANCELLED = 'cancelled',
}

export const liveSessionCreateDTOSchema = z.object({
    courseId: z.string().uuid(),
    lecturerId: z.string().uuid().optional(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    scheduledAt: z.string().or(z.date()),
    duration: z.number().min(15).default(90),
});

export type LiveSessionCreateDTO = z.infer<typeof liveSessionCreateDTOSchema>;

export const liveSessionUpdateDTOSchema = z.object({
    lecturerId: z.string().uuid().optional(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    scheduledAt: z.string().or(z.date()).optional(),
    duration: z.number().min(15).optional(),
    status: z.nativeEnum(LiveSessionStatus).optional(),
    meetingId: z.string().optional(),
});

export type LiveSessionUpdateDTO = z.infer<typeof liveSessionUpdateDTOSchema>;

export interface LiveSessionResponseDTO {
    id: string;
    courseId: string;
    lecturerId: string | null;
    title: string;
    description: string | null;
    scheduledAt: Date;
    duration: number;
    status: string;
    meetingId: string | null;
    createdAt: Date;
    updatedAt: Date;

    // Optional relation data
    lecturer?: {
        id: string;
        displayName: string;
        avatarUrl: string | null;
    };
}
