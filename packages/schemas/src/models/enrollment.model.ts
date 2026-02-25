import { z } from 'zod';
import { baseModelSchema } from './base.model';
import { EnrollmentStatus } from '../enums/enrollment.enum';

export const enrollmentSchema = baseModelSchema.extend({
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
  versionId: z.string().uuid().nullable().optional(),
  enrollmentDate: z.date(),
  completionStatus: z.nativeEnum(EnrollmentStatus).default(EnrollmentStatus.IN_PROGRESS),
  completionPercentage: z.number().min(0).max(100).default(0),
  lastAccessedAt: z.date().nullable().optional(),
  expiresAt: z.date().nullable().optional(),
  trialExpiresAt: z.date().nullable().optional(), // For Trial logic
  completedAt: z.date().nullable().optional(),
  paymentId: z.string().uuid().nullable().optional(),
  orderId: z.string().uuid().nullable().optional(),
  couponAppliedId: z.string().uuid().nullable().optional(),
  finalPrice: z.number().min(0),
  isGift: z.boolean().default(false),
  giftMessage: z.string().nullable().optional(),
  senderId: z.string().uuid().nullable().optional(),
});

export type Enrollment = z.infer<typeof enrollmentSchema>;

