import { z } from 'zod';

export const orderCheckoutSchema = z.object({
    offeringIds: z.array(z.string().uuid()),
    couponCode: z.string().optional(),
    paymentMethod: z.enum(['PAYOS', 'BANK_TRANSFER', 'MANUAL']),
});

export const orderPreviewSchema = z.object({
    offeringIds: z.array(z.string().uuid()),
    couponCode: z.string().optional(),
});
