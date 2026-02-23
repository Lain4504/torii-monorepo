
import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../src/modules/payment/order.service';
import { OrderRepository } from '../src/modules/payment/order.repository';
import { PayOSService } from '../src/modules/payment/payos.service';
import { CouponService } from '@server/billing/modules/coupon/coupon.service';
import { AppConfigService } from '@server/shared';
import { getMapperToken } from '@automapper/nestjs';
import { OrderStatus, OrderType, PaymentMethod } from '@workspace/schemas';
import { of } from 'rxjs';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('OrderService', () => {
    let service: OrderService;
    let orderRepository: jest.Mocked<OrderRepository>;
    let payOSService: jest.Mocked<PayOSService>;
    let couponService: jest.Mocked<CouponService>;
    let natsClient: any;
    let mapper: any;
    let appConfig: any;

    const mockUserId = 'user-123';
    const mockOrder = {
        id: 'order-123',
        userId: mockUserId,
        amount: 100000,
        status: OrderStatus.PENDING,
        orderType: OrderType.COURSE_PURCHASE,
        metadata: { courseId: 'course-123' },
        createdAt: new Date(),
    };

    beforeEach(async () => {
        const mockOrderRepository = {
            findMany: jest.fn(),
            count: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            countPayments: jest.fn(),
            findManyPayments: jest.fn(),
            getUserById: jest.fn(),
            findByTransactionId: jest.fn(),
            createPayment: jest.fn(),
        };

        const mockPayOSService = {
            createPaymentLink: jest.fn(),
            verifyPaymentWebhookData: jest.fn(),
        };

        const mockCouponService = {
            redeemCoupon: jest.fn(),
            releaseCoupon: jest.fn(),
        };

        const mockNatsClient = {
            send: jest.fn().mockReturnValue(of({})),
            emit: jest.fn().mockReturnValue(of({})),
        };

        const mockMapper = {
            map: jest.fn(),
        };

        const mockAppConfig = {
            identity: {
                frontendUrl: 'http://localhost:3000',
            },
            thirdParty: {
                payos: {
                    clientId: 'client-id',
                    apiKey: 'api-key',
                    checksumKey: 'checksum-key',
                },
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                { provide: OrderRepository, useValue: mockOrderRepository },
                { provide: PayOSService, useValue: mockPayOSService },
                { provide: CouponService, useValue: mockCouponService },
                { provide: AppConfigService, useValue: mockAppConfig },
                { provide: 'NATS_SERVICE', useValue: mockNatsClient },
                { provide: getMapperToken(), useValue: mockMapper },
            ],
        }).compile();

        service = module.get<OrderService>(OrderService);
        orderRepository = module.get(OrderRepository);
        payOSService = module.get(PayOSService);
        couponService = module.get(CouponService);
        natsClient = module.get('NATS_SERVICE');
        mapper = module.get(getMapperToken());
        appConfig = module.get(AppConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated orders', async () => {
            const query = { page: 1, limit: 10 };
            orderRepository.count.mockResolvedValue(1);
            orderRepository.findMany.mockResolvedValue([mockOrder]);
            mapper.map.mockReturnValue({ id: 'order-123' });

            const result = await service.findAll(query);

            expect(result.total).toBe(1);
            expect(result.data).toHaveLength(1);
            expect(orderRepository.findMany).toHaveBeenCalled();
        });
    });

    describe('create', () => {
        const createDto = {
            courseId: 'course-123',
            orderType: OrderType.COURSE_PURCHASE,
            paymentMethod: PaymentMethod.MOCK,
        };

        it('should create a course purchase order successfully', async () => {
            const mockCourse = { id: 'course-123', price: 100000, discountPrice: null, isFree: false };
            natsClient.send.mockImplementation((pattern: any) => {
                if (pattern.cmd === 'learning.course.findOne') return of(mockCourse);
                if (pattern.cmd === 'learning.enrollment.create') return of({ id: 'enroll-123' });
                return of(null);
            });
            orderRepository.create.mockResolvedValue(mockOrder as any);
            mapper.map.mockReturnValue({ ...mockOrder });

            const result = await service.create(mockUserId, createDto);

            expect(result).toBeDefined();
            expect(result.id).toBe('order-123');
            expect(natsClient.send).toHaveBeenCalledWith({ cmd: 'learning.course.findOne' }, { id: 'course-123' });
            expect(orderRepository.create).toHaveBeenCalled();
        });

        it('should throw NotFoundException if course not found', async () => {
            natsClient.send.mockReturnValue(of(null));

            await expect(service.create(mockUserId, createDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if course is free', async () => {
            const mockCourse = { id: 'course-123', price: 0, isFree: true };
            natsClient.send.mockReturnValue(of(mockCourse));

            await expect(service.create(mockUserId, createDto)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException for COURSE_PURCHASE if courseId is missing', async () => {
            const inputNoId = { ...createDto, courseId: undefined };
            await expect(service.create(mockUserId, inputNoId as any)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if amount is missing/invalid for top-up', async () => {
            const topUpInput = { orderType: OrderType.TOP_UP, amount: 0 };
            await expect(service.create(mockUserId, topUpInput as any)).rejects.toThrow(BadRequestException);
        });

        describe('gift order validation', () => {
            const giftInput = {
                ...createDto,
                orderType: OrderType.GIFT,
                metadata: { recipientEmail: 'recipient@test.com' }
            };

            it('should throw BadRequestException if recipient email is missing', async () => {
                const input = { ...giftInput, metadata: {} };
                await expect(service.create(mockUserId, input as any)).rejects.toThrow(BadRequestException);
            });

            it('should throw BadRequestException for gift order to self', async () => {
                orderRepository.getUserById.mockResolvedValue({ email: 'recipient@test.com' } as any);
                await expect(service.create(mockUserId, giftInput)).rejects.toThrow(BadRequestException);
            });

            it('should throw BadRequestException if gift recipient not found', async () => {
                orderRepository.getUserById.mockResolvedValue({ email: 'sender@test.com' } as any);
                natsClient.send.mockImplementation((pattern) => {
                    if (pattern.cmd === 'learning.course.findOne') return of({ id: 'c1', price: 100 });
                    if (pattern.cmd === 'identity.users.findOne') return of(null);
                    return of(null);
                });
                await expect(service.create(mockUserId, giftInput)).rejects.toThrow(BadRequestException);
            });

            it('should throw BadRequestException if gift recipient already owns course', async () => {
                orderRepository.getUserById.mockResolvedValue({ email: 'sender@test.com' } as any);
                natsClient.send.mockImplementation((pattern) => {
                    if (pattern.cmd === 'learning.course.findOne') return of({ id: 'c1', price: 100 });
                    if (pattern.cmd === 'identity.users.findOne') return of({ user: { id: 'rec-1', email: 'r@t.c' } });
                    if (pattern.cmd === 'learning.enrollment.isEnrolled') return of(true);
                    return of(null);
                });
                await expect(service.create(mockUserId, giftInput)).rejects.toThrow(BadRequestException);
            });
        });

        it('should throw BadRequestException if enrollment initialization fails', async () => {
            const mockCourse = { id: 'course-123', price: 100000 };
            natsClient.send.mockImplementation((pattern) => {
                if (pattern.cmd === 'learning.course.findOne') return of(mockCourse);
                if (pattern.cmd === 'learning.enrollment.create') throw new Error('Enrollment server down');
                return of(null);
            });

            await expect(service.create(mockUserId, createDto)).rejects.toThrow(BadRequestException);
        });

        it('should handle PayOS initialization failure by updating order state to FAILED', async () => {
            const mockCourse = { id: 'course-123', price: 100000 };
            const inputPayOS = { ...createDto, paymentMethod: PaymentMethod.PAYOS };

            natsClient.send.mockImplementation((pattern) => {
                if (pattern.cmd === 'learning.course.findOne') return of(mockCourse);
                if (pattern.cmd === 'learning.enrollment.create') return of({ id: 'enroll-123' });
                return of(null);
            });

            orderRepository.create.mockResolvedValue(mockOrder as any);
            payOSService.createPaymentLink.mockRejectedValue(new Error('Gateway error'));

            await expect(service.create(mockUserId, inputPayOS)).rejects.toThrow(BadRequestException);
            expect(orderRepository.update).toHaveBeenCalledWith(mockOrder.id, expect.objectContaining({
                status: OrderStatus.FAILED,
            }));
        });

        it('should throw BadRequestException if coupon redemption fails', async () => {
            const mockCourse = { id: 'course-123', price: 100000 };
            const inputWithCoupon = { ...createDto, couponCode: 'INVALID' };

            natsClient.send.mockReturnValue(of(mockCourse));
            couponService.redeemCoupon.mockRejectedValue(new Error('Invalid coupon'));

            await expect(service.create(mockUserId, inputWithCoupon)).rejects.toThrow(BadRequestException);
        });

        it('should apply coupon and recalculate amount', async () => {
            const mockCourse = { id: 'course-123', price: 100000 };
            const inputWithCoupon = { ...createDto, couponCode: 'SAVE10' };

            natsClient.send.mockImplementation((pattern) => {
                if (pattern.cmd === 'learning.course.findOne') return of(mockCourse);
                if (pattern.cmd === 'learning.enrollment.create') return of({ id: 'enroll-123' });
                return of(null);
            });

            couponService.redeemCoupon.mockResolvedValue({ couponId: 'coupon-1', discountAmount: 20000 });
            orderRepository.create.mockResolvedValue({ ...mockOrder, amount: 80000 } as any);

            await service.create(mockUserId, inputWithCoupon);

            expect(couponService.redeemCoupon).toHaveBeenCalledWith('SAVE10', mockUserId, 100000);
            expect(orderRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                amount: 80000,
            }));
        });

        it('should create PayOS payment link if payment method is PAYOS', async () => {
            const mockCourse = { id: 'course-123', price: 100000 };
            const inputPayOS = { ...createDto, paymentMethod: PaymentMethod.PAYOS };

            natsClient.send.mockImplementation((pattern) => {
                if (pattern.cmd === 'learning.course.findOne') return of(mockCourse);
                if (pattern.cmd === 'learning.enrollment.create') return of({ id: 'enroll-123' });
                return of(null);
            });

            orderRepository.create.mockResolvedValue(mockOrder as any);
            payOSService.createPaymentLink.mockResolvedValue({ checkoutUrl: 'http://pay.os/link', paymentLinkId: 'link-1' });

            await service.create(mockUserId, inputPayOS);

            expect(payOSService.createPaymentLink).toHaveBeenCalled();
            expect(orderRepository.update).toHaveBeenCalledWith(mockOrder.id, expect.objectContaining({
                metadata: expect.objectContaining({ checkoutUrl: 'http://pay.os/link' })
            }));
        });
    });

    describe('confirm', () => {
        const confirmDto = { orderId: mockOrder.id, transactionId: 'tx-123' };

        it('should confirm order and activate enrollment', async () => {
            const orderWithEnrollment = {
                ...mockOrder,
                status: OrderStatus.PENDING,
                enrollmentId: 'enroll-123',
                metadata: { courseId: 'course-123' }
            };
            orderRepository.findById.mockResolvedValue(orderWithEnrollment as any);
            orderRepository.update.mockResolvedValue({ ...orderWithEnrollment, status: OrderStatus.COMPLETED } as any);
            orderRepository.getUserById.mockResolvedValue({ id: mockUserId, email: 'test@test.com', displayName: 'Test' });

            natsClient.send.mockImplementation((pattern) => {
                if (pattern.cmd === 'learning.enrollment.activate') return of({ success: true });
                if (pattern.cmd === 'learning.course.findOne') return of({ id: 'course-123', title: 'Course' });
                return of(null);
            });

            await service.confirm(mockOrder.id, confirmDto);

            expect(orderRepository.update).toHaveBeenCalledWith(mockOrder.id, expect.objectContaining({
                status: OrderStatus.COMPLETED,
            }));
            expect(natsClient.send).toHaveBeenCalledWith({ cmd: 'learning.enrollment.activate' }, { enrollmentId: 'enroll-123' });
            expect(natsClient.emit).toHaveBeenCalledWith({ cmd: 'order_payment_success' }, expect.anything());
        });

        it('should throw NotFoundException if order does not exist', async () => {
            orderRepository.findById.mockResolvedValue(null);
            await expect(service.confirm('999', { orderId: '999' })).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if order status is already CANCELLED', async () => {
            orderRepository.findById.mockResolvedValue({ ...mockOrder, status: OrderStatus.CANCELLED } as any);
            await expect(service.confirm(mockOrder.id, { orderId: mockOrder.id })).rejects.toThrow(BadRequestException);
        });

        it('should handle TOP_UP order confirmation', async () => {
            const topUpOrder = {
                ...mockOrder,
                orderType: OrderType.TOP_UP,
                amount: 50000,
                status: OrderStatus.PENDING
            };
            orderRepository.findById.mockResolvedValue(topUpOrder as any);
            orderRepository.update.mockResolvedValue({ ...topUpOrder, status: OrderStatus.COMPLETED } as any);
            natsClient.send.mockReturnValue(of({ success: true }));

            await service.confirm(mockOrder.id, confirmDto);

            expect(natsClient.send).toHaveBeenCalledWith({ cmd: 'billing.user_balance.add' }, expect.objectContaining({
                amount: 50000,
            }));
        });
    });

    describe('autoCancelExpiredOrders', () => {
        it('should cancel orders older than 30 minutes', async () => {
            orderRepository.updateMany.mockResolvedValue(2);
            orderRepository.findMany.mockResolvedValue([
                { id: 'o1', userId: 'u1', enrollmentId: 'e1', metadata: { courseId: 'c1' } },
                { id: 'o2', userId: 'u1', enrollmentId: 'e2', metadata: { courseId: 'c2' } },
            ]);

            await service.autoCancelExpiredOrders();

            expect(orderRepository.updateMany).toHaveBeenCalled();
            expect(natsClient.send).toHaveBeenCalledTimes(2); // Cleanup enrollments
        });
    });

    describe('cancel', () => {
        it('should cancel pending order and release coupon', async () => {
            const orderWithCoupon = {
                ...mockOrder,
                status: OrderStatus.PENDING,
                couponId: 'coupon-1',
                userId: mockUserId
            };
            orderRepository.findById.mockResolvedValue(orderWithCoupon as any);
            orderRepository.update.mockResolvedValue({ ...orderWithCoupon, status: OrderStatus.CANCELLED } as any);

            await service.cancel(mockOrder.id, mockUserId, 'user');

            expect(orderRepository.update).toHaveBeenCalledWith(mockOrder.id, expect.objectContaining({
                status: OrderStatus.CANCELLED,
            }));
            expect(couponService.releaseCoupon).toHaveBeenCalledWith('coupon-1');
            expect(natsClient.emit).toHaveBeenCalledWith({ cmd: 'billing.order.cancelled' }, expect.anything());
        });

        it('should throw BadRequestException if not owner or admin', async () => {
            orderRepository.findById.mockResolvedValue(mockOrder as any);

            await expect(service.cancel(mockOrder.id, 'other-user', 'user')).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if order is not in PENDING status', async () => {
            orderRepository.findById.mockResolvedValue({ ...mockOrder, status: OrderStatus.COMPLETED } as any);
            await expect(service.cancel(mockOrder.id, mockUserId, 'user')).rejects.toThrow(BadRequestException);
        });
    });
});
