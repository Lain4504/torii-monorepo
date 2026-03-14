import { z } from 'zod';
import { paginationOptionsDTOSchema } from './common.dto';

// DTO cho Enrollment bám sát EnrollmentCreateDto / EnrollmentQueryDto bên service academy
// và model Prisma Enrollment.

export const academyEnrollmentCreateDTOSchema = z.object({
  userId: z.string().uuid(),
  classId: z.string().uuid(),
  offeringId: z.string().uuid().optional(),
  expiresAt: z.coerce.date().optional(),
  status: z.string().max(20).optional(),
  sourceOrderId: z.string().uuid().optional(),
});
export type AcademyEnrollmentCreateDTO = z.infer<
  typeof academyEnrollmentCreateDTOSchema
>;

export const academyEnrollmentUpdateDTOSchema = z.object({
  expiresAt: z.coerce.date().optional(),
  status: z.string().max(20).optional(),
});
export type AcademyEnrollmentUpdateDTO = z.infer<
  typeof academyEnrollmentUpdateDTOSchema
>;

export const academyEnrollmentQueryDTOSchema = paginationOptionsDTOSchema.extend({
  classId: z.string().uuid().optional(),
  offeringId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: z.string().optional(),
});
export type AcademyEnrollmentQueryDTO = z.infer<
  typeof academyEnrollmentQueryDTOSchema
>;

// Model dùng cho web-learner (giữ nguyên các field enrich để không phá API hiện tại)
export const academyEnrollmentModelSchema = z.object({
  id: z.string().uuid(),
  classId: z.string().uuid(),
  userId: z.string().uuid(),
  expiresAt: z.coerce.date().nullable(),
  status: z.string(),
  offeringId: z.string().uuid().nullable().optional(),
  sourceOrderId: z.string().uuid().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  // Relations
  class: z.any().optional(),
  user: z.any().optional(),

  // Learner View Rich Fields (Calculated by backend for learner portal)
  courseProfileId: z.string().uuid().optional(),
  courseCode: z.string().optional(),
  courseTitle: z.string().optional(),
  slug: z.string().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  instructorName: z.string().optional(),
  instructorAvatar: z.string().nullable().optional(),
  progress: z.number().optional(),
  completedLessons: z.number().optional(),
  totalLessons: z.number().optional(),
});
export type AcademyEnrollmentModel = z.infer<typeof academyEnrollmentModelSchema>;
