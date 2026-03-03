import { z } from 'zod';
import { attendanceModelSchema } from '../models/attendance.model';
import { paginationQuerySchema, paginatedResponseSchema } from './common.dto';

// Create
export const attendanceCreateDTOSchema = attendanceModelSchema.pick({
  liveSessionId: true,
  userId: true,
  status: true,
  joinTime: true,
  leaveTime: true,
  duration: true,
  notes: true,
}).partial({
  status: true,
  joinTime: true,
  leaveTime: true,
  duration: true,
  notes: true,
});

export type AttendanceCreateDTO = z.infer<typeof attendanceCreateDTOSchema>;

// Update
export const attendanceUpdateDTOSchema = attendanceCreateDTOSchema.partial();

export type AttendanceUpdateDTO = z.infer<typeof attendanceUpdateDTOSchema>;

// Query
export const attendanceQueryDTOSchema = paginationQuerySchema.extend({
  liveSessionId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: z.enum(['present', 'absent', 'late', 'excused']).optional(),
  courseMasterId: z.string().uuid().optional(), // To filter by course master
});

export type AttendanceQueryDTO = z.infer<typeof attendanceQueryDTOSchema>;

// Response
export const attendanceResponseDTOSchema = attendanceModelSchema.extend({
  user: z.object({
    id: z.string(),
    displayName: z.string(),
    email: z.string(),
    avatarUrl: z.string().nullable(),
  }).optional(),
});

export type AttendanceResponseDTO = z.infer<typeof attendanceResponseDTOSchema>;

export const attendancePaginatedResponseSchema = paginatedResponseSchema(attendanceResponseDTOSchema);
export type AttendancePaginatedResponse = z.infer<typeof attendancePaginatedResponseSchema>;
