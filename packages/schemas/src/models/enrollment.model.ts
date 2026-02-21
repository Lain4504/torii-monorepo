import { z } from 'zod';

export enum EnrollmentStatus {
    PENDING_PAYMENT = 'pending_payment',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    DROPPED = 'dropped',
}

export const enrollmentSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    courseId: z.string().uuid(),
    versionId: z.string().uuid().optional(),
    enrollmentDate: z.date(),
    completionStatus: z.nativeEnum(EnrollmentStatus).default(EnrollmentStatus.IN_PROGRESS),
    completionPercentage: z.number().min(0).max(100).default(0),
    lastAccessedAt: z.date().optional(),
    completedAt: z.date().optional(),
    paymentId: z.string().uuid().optional(),
    couponAppliedId: z.string().uuid().optional(),
    finalPrice: z.number().min(0),
    isGift: z.boolean().default(false),
    giftMessage: z.string().optional(),
    senderId: z.string().uuid().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Enrollment = z.infer<typeof enrollmentSchema>;

