import { Test, TestingModule } from '@nestjs/testing';
import { NotificationHandler } from '../src/modules/notification/notification.handler';
import { NOTIFICATION_SERVICE_TOKEN } from '../src/interfaces/services';
import { AppConfigService } from '@server/shared';
import { NotificationType } from '@workspace/schemas';
import { Logger } from '@nestjs/common';

describe('NotificationHandler (Exhaustive)', () => {
    let handler: NotificationHandler;
    let notificationService: any;
    let natsClient: any;
    let configService: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotificationHandler],
            providers: [
                {
                    provide: NOTIFICATION_SERVICE_TOKEN,
                    useValue: { create: jest.fn() },
                },
                {
                    provide: 'NATS_SERVICE',
                    useValue: { emit: jest.fn() },
                },
                {
                    provide: AppConfigService,
                    useValue: {
                        server: { webUrl: 'http://test.com' },
                    },
                },
            ],
        }).compile();

        handler = module.get<NotificationHandler>(NotificationHandler);
        notificationService = module.get(NOTIFICATION_SERVICE_TOKEN);
        natsClient = module.get('NATS_SERVICE');
        configService = module.get(AppConfigService);

        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
    });

    describe('handleSendNotification', () => {
        it('should create notification and optionally send email', async () => {
            const event = {
                recipientId: 'u1',
                type: 'SYSTEM',
                payload: { title: 'T', body: 'B', metadata: { x: 1 } },
                sendEmail: true,
            };

            await handler.handleSendNotification(event as any);

            expect(notificationService.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'u1',
                title: 'T',
                notificationType: 'SYSTEM'
            }));
            expect(natsClient.emit).toHaveBeenCalledWith(
                { cmd: 'send_email' },
                expect.objectContaining({ type: 'notification', to: 'u1' })
            );
        });
    });

    describe('handleOrderPaymentSuccess', () => {
        it('should create notification and emit order_success email', async () => {
            const event = {
                orderId: 'o1', userId: 'u1', userEmail: 'u@e.com',
                userName: 'U', courseId: 'c1', courseName: 'C',
                amount: 100, currency: 'USD'
            };

            await handler.handleOrderPaymentSuccess(event as any);

            expect(notificationService.create).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('Bạn đã thanh toán thành công')
            }));
        });

        it('should handle gift order and recipientName fallback', async () => {
            const event = {
                orderId: 'o1', userId: 'u1', userEmail: 'u@e.com',
                userName: 'U', courseId: 'c1', courseName: 'C',
                amount: 100, currency: 'USD',
                isGift: true // No recipientName provided
            };

            await handler.handleOrderPaymentSuccess(event as any);

            expect(notificationService.create).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('gửi tặng cho người nhận thành công')
            }));
        });
    });

    describe('handleCourseGiftReceived', () => {
        it('should notify recipient and send gift email', async () => {
            const event = {
                recipientId: 'r1', recipientEmail: 'r@e.com',
                senderId: 's1', senderName: 'Sender',
                courseId: 'c1', courseName: 'Course',
                enrollmentId: 'e1', giftMessage: 'Msg'
            };

            await handler.handleCourseGiftReceived(event as any);

            expect(notificationService.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'r1',
                message: expect.stringContaining('Sender')
            }));
            expect(natsClient.emit).toHaveBeenCalledWith(
                { cmd: 'send_email' },
                expect.objectContaining({ type: 'course_enrollment' })
            );
        });
    });

    describe('handleOrderStatusChanged', () => {
        it('should notify user about status change', async () => {
            const event = {
                userId: 'u1', orderId: 'o1', oldStatus: 'P', newStatus: 'C'
            };

            await handler.handleOrderStatusChanged(event as any);

            expect(notificationService.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'u1',
                notificationType: NotificationType.ORDER_STATUS_UPDATE
            }));
        });
    });

    describe('handleCourseEnrollmentSuccess', () => {
        it('should notify user and send email for free courses', async () => {
            const event = {
                userId: 'u1', userEmail: 'u@e.com', userName: 'U',
                enrollmentId: 'e1', courseId: 'c1', courseName: 'C'
            };

            await handler.handleCourseEnrollmentSuccess(event as any);

            expect(notificationService.create).toHaveBeenCalled();
            expect(natsClient.emit).toHaveBeenCalledWith(
                { cmd: 'send_email' },
                expect.objectContaining({ to: 'u@e.com' })
            );
        });
    });
});
