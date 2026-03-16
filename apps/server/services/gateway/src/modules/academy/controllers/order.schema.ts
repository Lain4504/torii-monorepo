import { z } from 'zod';

export const orderCheckoutSchema = z.object({
    // Course offerings (VOD/LIVE)
    offeringIds: z.array(z.string()).optional(),
    // AI subscription plans
    subscriptionPlanIds: z.array(z.string()).optional(),
    // For LIVE: map offeringId -> selected classId (one per offering)
    classIdByOffering: z
        .record(z.string().uuid(), z.string().uuid())
        .optional(),
    couponCode: z.string().optional(),
    description: z.string().optional(),
    metadata: z.any().optional(),
    paymentMethod: z.preprocess(
        (value) => (typeof value === 'string' ? value.toUpperCase() : value),
        z.enum(['PAYOS', 'BANK_TRANSFER', 'MANUAL']),
    ),
});

export const orderPreviewSchema = z.object({
    offeringIds: z.array(z.string()).optional(),
    subscriptionPlanIds: z.array(z.string()).optional(),
    // For LIVE: map offeringId -> selected classId (one per offering)
    classIdByOffering: z
        .record(z.string().uuid(), z.string().uuid())
        .optional(),
    couponCode: z.string().optional(),
    description: z.string().optional(),
});
