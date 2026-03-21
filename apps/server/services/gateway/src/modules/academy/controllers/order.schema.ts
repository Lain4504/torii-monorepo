import { z } from 'zod';

/** offeringId → classId (bắt buộc cho LIVE khi preview/checkout) */
const classIdByOfferingSchema = z
  .record(z.string().uuid(), z.string().uuid())
  .optional();

export const orderCheckoutSchema = z.object({
  // Course offerings (VOD/LIVE)
  offeringIds: z.array(z.string()).optional(),
  // AI subscription plans
  subscriptionPlanIds: z.array(z.string()).optional(),
  couponCode: z.string().optional(),
  description: z.string().optional(),
  metadata: z.any().optional(),
  classIdByOffering: classIdByOfferingSchema,
  paymentMethod: z.preprocess(
    (value) => (typeof value === 'string' ? value.toUpperCase() : value),
    z.enum(['PAYOS', 'BANK_TRANSFER', 'MANUAL']),
  ),
});

export const orderPreviewSchema = z.object({
  offeringIds: z.array(z.string()).optional(),
  subscriptionPlanIds: z.array(z.string()).optional(),
  couponCode: z.string().optional(),
  description: z.string().optional(),
  classIdByOffering: classIdByOfferingSchema,
});
