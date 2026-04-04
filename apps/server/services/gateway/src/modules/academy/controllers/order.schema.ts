import { z } from 'zod';

/** cohortId -> liveClassId */
const liveClassIdByCohortSchema = z
  .record(z.string().uuid(), z.string().uuid())
  .optional();

/** legacy: offeringId -> classId */
const classIdByOfferingSchema = z
  .record(z.string().uuid(), z.string().uuid())
  .optional();

export const orderCheckoutSchema = z.object({
  vodPackageIds: z.array(z.string().uuid()).optional(),
  cohortIds: z.array(z.string().uuid()).optional(),
  liveClassIds: z.array(z.string().uuid()).optional(),
  liveClassIdByCohort: liveClassIdByCohortSchema,
  // AI subscription plans
  subscriptionPlanIds: z.array(z.string().uuid()).optional(),
  couponCode: z.string().optional(),
  description: z.string().optional(),
  metadata: z.any().optional(),
  paymentMethod: z.preprocess(
    (value) => (typeof value === 'string' ? value.toUpperCase() : value),
    z.enum(['PAYOS', 'BANK_TRANSFER', 'MANUAL', 'COIN']),
  ),
  paymentGateway: z.preprocess(
    (value) => (typeof value === 'string' ? value.toUpperCase() : value),
    z.enum(['PAYOS', 'MOMO', 'STRIPE', 'INTERNAL']).optional(),
  ),

  // Legacy compatibility (ignored by academy new flow)
  offeringIds: z.array(z.string()).optional(),
  classIdByOffering: classIdByOfferingSchema,
});

export const orderPreviewSchema = z.object({
  // New flow
  vodPackageIds: z.array(z.string().uuid()).optional(),
  cohortIds: z.array(z.string().uuid()).optional(),
  liveClassIds: z.array(z.string().uuid()).optional(),
  liveClassIdByCohort: liveClassIdByCohortSchema,
  subscriptionPlanIds: z.array(z.string().uuid()).optional(),
  couponCode: z.string().optional(),
  description: z.string().optional(),

  // Legacy compatibility
  offeringIds: z.array(z.string()).optional(),
  classIdByOffering: classIdByOfferingSchema,
});
