import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { OrderStatus, PaymentMethod, PaymentGateway, OfferingStatus } from '@prisma/generated';
import { CouponService } from '../coupon.service';
import { PayOSService } from '../payos.service';
import { EnrollmentService } from '../../classroom/enrollment/enrollment.service';
import { OrderCheckoutDto, OrderPreviewDto } from './dto/order.dto';
import { Prisma } from '@prisma/generated';

@Injectable()
export class OrderService {
    private readonly logger = new Logger(OrderService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly couponService: CouponService,
        private readonly payOS: PayOSService,
        private readonly enrollmentService: EnrollmentService,
    ) { }

    async preview(userId: string, input: OrderPreviewDto) {
        const offerings = await this.prisma.courseOffering.findMany({
            where: { id: { in: input.offeringIds }, status: OfferingStatus.ACTIVE },
        });

        if (offerings.length !== input.offeringIds.length) {
            throw new BadRequestException('Some offerings are not available');
        }

        const subTotal = offerings.reduce((sum, o) => sum + Number(o.originalPrice), 0);
        let discountTotal = 0;
        let couponId: string | undefined;

        if (input.couponCode) {
            const coupon = await this.couponService.validateCoupon(
                input.couponCode,
                userId,
                subTotal,
                input.offeringIds,
            );
            discountTotal = await this.couponService.calculateDiscount(coupon.id, subTotal);
            couponId = coupon.id;
        }

        const grandTotal = Math.max(0, subTotal - discountTotal);

        return {
            subTotal,
            discountTotal,
            grandTotal,
            offerings,
            couponId,
        };
    }

    async checkout(userId: string, input: OrderCheckoutDto) {
        const preview = await this.preview(userId, input);

        // Generate readable code: ORD-YYYYMMDD-XXXX
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const orderCode = `ORD-${dateStr}-${randomStr}`;

        const order = await this.prisma.order.create({
            data: {
                code: orderCode,
                userId,
                status: OrderStatus.PENDING,
                subTotal: new Prisma.Decimal(preview.subTotal),
                discountTotal: new Prisma.Decimal(preview.discountTotal),
                grandTotal: new Prisma.Decimal(preview.grandTotal),
                currency: preview.offerings[0]?.currency || 'VND',
                couponCode: input.couponCode,
                couponId: preview.couponId,
                paymentMethod: input.paymentMethod as PaymentMethod,
                items: {
                    create: preview.offerings.map(o => ({
                        offeringId: o.id,
                        price: o.originalPrice,
                        offeringSnapshot: {
                            title: o.title,
                            code: o.code,
                        } as any,
                    })),
                },
            },
        });

        if (input.paymentMethod === PaymentMethod.PAYOS) {
            const numericOrderCode = Number(Date.now().toString().slice(-9)) + Math.floor(Math.random() * 1000);

            const paymentLink = await this.payOS.createPaymentLink({
                orderCode: numericOrderCode,
                amount: preview.grandTotal,
                description: `Thanh toán đơn hàng ${order.code}`,
                cancelUrl: 'https://your-frontend.com/payment/cancel',
                returnUrl: 'https://your-frontend.com/payment/success',
                items: preview.offerings.map(o => ({
                    name: o.title,
                    quantity: 1,
                    price: Number(o.originalPrice),
                })),
            });

            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    metadata: {
                        paymentLinkId: paymentLink.paymentLinkId,
                        numericOrderCode,
                        checkoutUrl: paymentLink.checkoutUrl,
                    } as any,
                },
            });

            return {
                orderCode: order.code,
                paymentUrl: paymentLink.checkoutUrl,
            };
        }

        return {
            orderCode: order.code,
            message: 'Order created. Please proceed with manual payment.',
        };
    }

    async handlePaymentSuccess(orderCode: string, transactionId?: string, payload?: any) {
        const order = await this.prisma.order.findUnique({
            where: { code: orderCode },
            include: { items: true },
        });

        if (!order) {
            const numericCode = Number(orderCode);
            if (!isNaN(numericCode)) {
                const orderWithMetadata = await this.prisma.order.findFirst({
                    where: {
                        metadata: {
                            path: ['numericOrderCode'],
                            equals: numericCode,
                        },
                    },
                    include: { items: true },
                });
                if (orderWithMetadata) return this.processPayment(orderWithMetadata, transactionId, payload);
            }
            throw new NotFoundException('Order not found');
        }

        return this.processPayment(order, transactionId, payload);
    }

    private async processPayment(order: any, transactionId?: string, payload?: any) {
        if (order.status === OrderStatus.PAID) return { ok: true };

        await this.prisma.$transaction(async (tx) => {
            // Update Order
            await tx.order.update({
                where: { id: order.id },
                data: {
                    status: OrderStatus.PAID,
                    paidAt: new Date(),
                },
            });

            // Update Coupon Usage
            if (order.couponId) {
                await this.couponService.recordUsage(tx, order.couponId, order.userId, order.id);
            }

            // Record Transaction
            await tx.transaction.create({
                data: {
                    orderId: order.id,
                    gateway: PaymentGateway.PAYOS,
                    transactionCode: transactionId,
                    amount: order.grandTotal,
                    status: 'SUCCESS',
                    responsePayload: payload || {},
                },
            });

            // Fulfillment: Enrollments
            for (const item of order.items) {
                const offeringClasses = await tx.courseOfferingClass.findMany({
                    where: { offeringId: item.offeringId },
                });

                for (const oc of offeringClasses) {
                    const existing = await tx.enrollment.findFirst({
                        where: {
                            userId: order.userId,
                            classId: oc.classId,
                            status: 'ACTIVE',
                        },
                    });

                    if (!existing) {
                        await tx.enrollment.create({
                            data: {
                                userId: order.userId,
                                classId: oc.classId,
                                status: 'ACTIVE',
                                sourceOfferingId: item.offeringId,
                                sourceOrderId: order.id,
                            },
                        });
                    }
                }
            }
        });

        this.logger.log(`Order ${order.code} fulfilled successfully`);
        return { ok: true };
    }
}
