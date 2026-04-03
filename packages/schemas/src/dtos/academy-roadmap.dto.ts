import { z } from 'zod';

export const roadmapTaskStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'SKIPPED',
]);
export type RoadmapTaskStatus = z.infer<typeof roadmapTaskStatusSchema>;

export const roadmapTaskTypeSchema = z.enum([
  'LESSON',
  'LIVE_SESSION',
  'REVIEW',
  'PRACTICE',
]);
export type RoadmapTaskType = z.infer<typeof roadmapTaskTypeSchema>;

export const roadmapReplanTriggerSchema = z.enum([
  'SYSTEM_WEEKLY',
  'USER_REQUEST',
  'ORDER_PAID',
]);
export type RoadmapReplanTrigger = z.infer<typeof roadmapReplanTriggerSchema>;

export const academyRoadmapTaskUpdateDTOSchema = z.object({
  status: roadmapTaskStatusSchema,
  actualMinutes: z.number().int().min(0).max(600).optional(),
});
export type AcademyRoadmapTaskUpdateDTO = z.infer<
  typeof academyRoadmapTaskUpdateDTOSchema
>;

export const academyRoadmapReplanDTOSchema = z.object({
  trigger: roadmapReplanTriggerSchema.default('USER_REQUEST'),
});
export type AcademyRoadmapReplanDTO = z.infer<
  typeof academyRoadmapReplanDTOSchema
>;

export const academyRoadmapTaskModelSchema = z.object({
  id: z.string().uuid(),
  taskType: roadmapTaskTypeSchema,
  title: z.string(),
  description: z.string().nullable().optional(),
  priority: z.number().int().min(1).max(5),
  estimatedMinutes: z.number().int().min(0),
  actualMinutes: z.number().int().min(0).nullable().optional(),
  status: roadmapTaskStatusSchema,
  dueAt: z.coerce.date().nullable().optional(),
  completedAt: z.coerce.date().nullable().optional(),
  sourceRef: z.string().nullable().optional(),
  metadata: z.any().optional(),
});
export type AcademyRoadmapTaskModel = z.infer<typeof academyRoadmapTaskModelSchema>;

export const academyRoadmapModelSchema = z.object({
  id: z.string().uuid(),
  status: z.string(),
  currentWeek: z.number().int().min(1),
  version: z.number().int().min(1),
  targetEnrollmentId: z.string().uuid(),
  targetId: z.string().uuid().nullable().optional(),
  learnHref: z.string().nullable().optional(),
  todayFocus: z.array(academyRoadmapTaskModelSchema),
  weekPlan: z.array(academyRoadmapTaskModelSchema),
  nextBestAction: academyRoadmapTaskModelSchema.nullable(),
  generatedAt: z.coerce.date(),
});
export type AcademyRoadmapModel = z.infer<typeof academyRoadmapModelSchema>;

