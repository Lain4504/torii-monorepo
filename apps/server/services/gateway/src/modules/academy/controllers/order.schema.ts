import { z } from 'zod';

export const orderCheckoutSchema = z.object({
    offeringIds: z.array(z.string()).optional(),
    subscriptionPlanIds: z.array(z.string()).optional(),
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
    couponCode: z.string().optional(),
    description: z.string().optional(),
});
