import { z } from 'zod';
import { orderSchema, OrderStatus, PaymentMethod, PaymentGateway, OrderType } from '../models/order.model';

export const orderResponseDTOSchema = orderSchema;

export type OrderResponseDTO = z.infer<typeof orderResponseDTOSchema>;

export const orderCreateDTOSchema = z.object({
    courseId: z.string().uuid().optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.MOCK),
    paymentGateway: z.nativeEnum(PaymentGateway).optional(),
    orderType: z.nativeEnum(OrderType).default(OrderType.COURSE_PURCHASE),
    description: z.string().optional(),
    returnUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
    metadata: z.record(z.any()).optional(),
});

export type OrderCreateDTO = z.infer<typeof orderCreateDTOSchema>;

export const orderQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
    userId: z.string().uuid().optional(),
    courseId: z.string().uuid().optional(),
    status: z.nativeEnum(OrderStatus).optional(),
});

export type OrderQueryDTO = z.infer<typeof orderQueryDTOSchema>;

export const orderConfirmDTOSchema = z.object({
    orderId: z.string().uuid(),
    transactionId: z.string().optional(),
    gatewayTransactionId: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});

export type OrderConfirmDTO = z.infer<typeof orderConfirmDTOSchema>;

export const orderPaginatedResponseSchema = z.object({
    data: z.array(orderResponseDTOSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

export type OrderPaginatedResponse = z.infer<typeof orderPaginatedResponseSchema>;

