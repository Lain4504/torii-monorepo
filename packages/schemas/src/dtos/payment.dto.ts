import { z } from 'zod';
import { paymentSchema, PaymentStatus, PaymentMethod, PaymentGateway, PaymentType } from '../models/payment.model';

export const paymentResponseDTOSchema = paymentSchema;

export type PaymentResponseDTO = z.infer<typeof paymentResponseDTOSchema>;

export const paymentCreateDTOSchema = z.object({
    courseId: z.string().uuid().optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.MOCK),
    paymentGateway: z.nativeEnum(PaymentGateway).optional(),
    paymentType: z.nativeEnum(PaymentType).default(PaymentType.COURSE_PURCHASE),
    description: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});

export type PaymentCreateDTO = z.infer<typeof paymentCreateDTOSchema>;

export const paymentQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
    userId: z.string().uuid().optional(),
    courseId: z.string().uuid().optional(),
    status: z.nativeEnum(PaymentStatus).optional(),
});

export type PaymentQueryDTO = z.infer<typeof paymentQueryDTOSchema>;

export const paymentConfirmDTOSchema = z.object({
    paymentId: z.string().uuid(),
    transactionId: z.string().optional(),
    gatewayTransactionId: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});

export type PaymentConfirmDTO = z.infer<typeof paymentConfirmDTOSchema>;

export const paymentPaginatedResponseSchema = z.object({
    data: z.array(paymentResponseDTOSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

export type PaymentPaginatedResponse = z.infer<typeof paymentPaginatedResponseSchema>;

