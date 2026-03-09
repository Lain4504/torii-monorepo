import { z } from 'zod';

export const academyLiveScheduleConflictPreviewDTOSchema = z.object({
  liveClassId: z.string().uuid(),
  excludeScheduleId: z.string().uuid().optional(),
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().min(1).max(20),
  endTime: z.string().min(1).max(20),
});
export type AcademyLiveScheduleConflictPreviewDTO = z.infer<
  typeof academyLiveScheduleConflictPreviewDTOSchema
>;

export const academyLiveScheduleRequestCreateDTOSchema = z.object({
  liveScheduleId: z.string().uuid(),
  type: z.enum(['LEAVE', 'RESCHEDULE']),
  requestedDate: z.string().datetime(),
  proposedDate: z.string().datetime().optional(),
  proposedStartTime: z.string().max(20).optional(),
  proposedEndTime: z.string().max(20).optional(),
  proposedTeacherId: z.string().uuid().optional(),
  reason: z.string().optional(),
});
export type AcademyLiveScheduleRequestCreateDTO = z.infer<
  typeof academyLiveScheduleRequestCreateDTOSchema
>;

export const academyLiveScheduleRequestApproveDTOSchema = z.object({
  reviewNote: z.string().optional(),
});
export type AcademyLiveScheduleRequestApproveDTO = z.infer<
  typeof academyLiveScheduleRequestApproveDTOSchema
>;

export const academyLiveScheduleRequestRejectDTOSchema = z.object({
  reviewNote: z.string().min(1),
});
export type AcademyLiveScheduleRequestRejectDTO = z.infer<
  typeof academyLiveScheduleRequestRejectDTOSchema
>;

export const academyLiveScheduleRequestQueryDTOSchema = z.object({
  liveScheduleId: z.string().uuid().optional(),
  requestedBy: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});
export type AcademyLiveScheduleRequestQueryDTO = z.infer<
  typeof academyLiveScheduleRequestQueryDTOSchema
>;
