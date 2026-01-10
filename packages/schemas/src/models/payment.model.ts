import { z } from 'zod';

export enum PaymentStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded',
    CANCELLED = 'cancelled',
}

export enum PaymentMethod {
    CREDIT_CARD = 'credit_card',
    BANK_TRANSFER = 'bank_transfer',
    MOMO = 'momo',
    ZALOPAY = 'zalopay',
    VNPAY = 'vnpay',
    MOCK = 'mock',
}

export enum PaymentGateway {
    STRIPE = 'stripe',
    PAYPAL = 'paypal',
    VNPAY = 'vnpay',
    MOMO = 'momo',
    MOCK = 'mock',
}

export enum PaymentType {
    COURSE_PURCHASE = 'course_purchase',
    SUBSCRIPTION = 'subscription',
    TOP_UP = 'top_up',
    GIFT = 'gift',
}

export const paymentSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    amount: z.number().min(0),
    currency: z.string().length(3).default('VND'),
    paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.MOCK),
    paymentGateway: z.nativeEnum(PaymentGateway).optional(),
    transactionId: z.string().optional(),
    gatewayTransactionId: z.string().optional(),
    status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
    paymentType: z.nativeEnum(PaymentType).default(PaymentType.COURSE_PURCHASE),
    enrollmentId: z.string().uuid().optional(),
    couponId: z.string().uuid().optional(),
    description: z.string().optional(),
    metadata: z.record(z.any()).default({}), // originalAmount and discountAmount are stored in metadata
    completedAt: z.date().optional(),
    failedAt: z.date().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Payment = z.infer<typeof paymentSchema>;

