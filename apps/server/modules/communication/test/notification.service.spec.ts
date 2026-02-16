import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../src/modules/notification/notification.service';
import { PrismaService } from '@server/shared';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../src/interfaces/repositories';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { NotificationType } from '@workspace/schemas';
import type {
    NotificationCreateDTO,
    NotificationQueryDTO,

} from '@workspace/schemas';

describe('NotificationService', () => {
    let service: NotificationService;
    let notificationRepository: any;
    let prisma: any;

    const USER_ID = '00000000-0000-0000-0000-000000000001';
    const NOTIFICATION_ID = '00000000-0000-0000-0000-000000000002';
    const COURSE_ID = '00000000-0000-0000-0000-000000000003';

    const mockNotification = {
        id: NOTIFICATION_ID,
        userId: USER_ID,
        title: 'Test Notification',
        message: 'Test Message',
        notificationType: NotificationType.SYSTEM,
        metadata: { key: 'value' },
        isRead: false,
        readAt: null as Date | null,
        sentVia: ['in_app'],
        createdAt: new Date(),
        updatedAt: new Date(),
    };



    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationService,
                {
                    provide: NOTIFICATION_REPOSITORY_TOKEN,
                    useValue: {
                        findById: jest.fn(),
                        findByIdAndUserId: jest.fn(),
                        findMany: jest.fn(),
                        count: jest.fn(),
                        create: jest.fn(),
                        createMany: jest.fn(),
                        update: jest.fn(),
                        updateMany: jest.fn(),
                        delete: jest.fn(),
                    },
                },
                {
                    provide: PrismaService,
                    useValue: {
                        post: { findUnique: jest.fn() },
                        user: { findUnique: jest.fn() },
                        $queryRaw: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<NotificationService>(NotificationService);
        notificationRepository = module.get(NOTIFICATION_REPOSITORY_TOKEN);
        prisma = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated notifications', async () => {
            const query: NotificationQueryDTO = { page: 1, limit: 10 };
            notificationRepository.count.mockResolvedValue(1);
            notificationRepository.findMany.mockResolvedValue([mockNotification]);

            const result = await service.findAll(USER_ID, query);

            expect(notificationRepository.count).toHaveBeenCalled();
            expect(notificationRepository.findMany).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
        });

        it('should throw BadRequestException on repository error', async () => {
            notificationRepository.count.mockRejectedValue(new Error('DB Error'));
            await expect(service.findAll(USER_ID, {} as NotificationQueryDTO)).rejects.toThrow(BadRequestException);
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read', async () => {
            notificationRepository.findByIdAndUserId.mockResolvedValue(mockNotification);
            notificationRepository.update.mockResolvedValue({ ...mockNotification, isRead: true });

            const result = await service.markAsRead(NOTIFICATION_ID, USER_ID);

            expect(notificationRepository.update).toHaveBeenCalledWith(NOTIFICATION_ID, expect.objectContaining({ isRead: true }));
            expect(result.isRead).toBe(true);
        });

        it('should throw NotFoundException if notification not found', async () => {
            notificationRepository.findByIdAndUserId.mockResolvedValue(null);
            await expect(service.markAsRead(NOTIFICATION_ID, USER_ID)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getUnreadCount', () => {
        it('should return unread count', async () => {
            notificationRepository.count.mockResolvedValue(5);
            const result = await service.getUnreadCount(USER_ID);
            expect(result.count).toBe(5);
        });
    });

    describe('create', () => {
        it('should create a new notification', async () => {
            const createDto: NotificationCreateDTO = {
                userId: USER_ID,
                title: 'New',
                message: 'Msg',
                notificationType: NotificationType.SYSTEM,
            };
            notificationRepository.create.mockResolvedValue(mockNotification);
            const result = await service.create(createDto);
            expect(notificationRepository.create).toHaveBeenCalled();
            expect(result.id).toBe(NOTIFICATION_ID);
        });
    });

    describe('handleCoursePublished', () => {
        it('should create notifications for provided userIds', async () => {
            const payload = {
                courseId: COURSE_ID,
                courseTitle: 'JLPT N3',
                courseJlptLevel: 'N3',
                userIds: [USER_ID],
            };

            await service.handleCoursePublished(payload);

            expect(notificationRepository.createMany).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ userId: USER_ID })
                ])
            );
        });

        it('should query wishlist if userIds not provided', async () => {
            const payload = {
                courseId: COURSE_ID,
                courseTitle: 'JLPT N3',
                courseJlptLevel: 'N3',
            };
            prisma.$queryRaw.mockResolvedValue([{ user_id: USER_ID }]);

            await service.handleCoursePublished(payload);

            expect(prisma.$queryRaw).toHaveBeenCalled();
            expect(notificationRepository.createMany).toHaveBeenCalled();
        });
    });

    describe('handleSendNotification', () => {
        it('should create notification from send_notification event', async () => {
            const payload = {
                recipientId: USER_ID,
                type: 'COMMENT_REPLY' as const,
                payload: {
                    title: 'Reply',
                    body: 'Content',
                    metadata: { commentId: '123' },
                },
            };

            await service.handleSendNotification(payload);

            expect(notificationRepository.create).toHaveBeenCalled();
        });
    });
});
