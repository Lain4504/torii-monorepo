import { z } from 'zod';
import { baseModelSchema } from './base.model';

export const attendanceModelSchema = baseModelSchema.extend({
  liveSessionId: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.enum(['present', 'absent', 'late', 'excused']).default('present'),
  joinTime: z.date().nullable().optional(),
  leaveTime: z.date().nullable().optional(),
  duration: z.number().int().min(0).default(0), // seconds
  notes: z.string().nullable().optional(),
});

export type Attendance = z.infer<typeof attendanceModelSchema>;
