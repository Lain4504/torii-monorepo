import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../src/modules/notification/notification.service';
import { PrismaService } from '@server/shared';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../src/interfaces/repositories';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { NotificationType } from '@workspace/schemas';
import type {
    NotificationCreateDTO,
    NotificationQueryDTO,
} from '@workspace/schemas';

describe('NotificationService (Exhaustive)', () => {
    let service: NotificationService;
    let notificationRepository: any;
    let prisma: any;

    const USER_ID = '00000000-0000-0000-0000-000000000001';
    const NOTIFICATION_ID = '00000000-0000-0000-0000-000000000002';
    const COURSE_ID = '00000000-0000-0000-0000-000000000003';
    const BLOG_ID = '00000000-0000-0000-0000-000000000004';

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
                        blog: { findUnique: jest.fn() },
                        user: { findUnique: jest.fn() },
                        $queryRaw: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<NotificationService>(NotificationService);
        notificationRepository = module.get(NOTIFICATION_REPOSITORY_TOKEN);
        prisma = module.get(PrismaService);

        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
    });

    afterEach(() => jest.clearAllMocks());

    describe('findAll', () => {
        it('should handle pagination and filtering defaults', async () => {
            const query: any = { page: 0, limit: 0, isRead: 'true' };
            notificationRepository.count.mockResolvedValue(1);
            notificationRepository.findMany.mockResolvedValue([mockNotification]);

            const result = await service.findAll(USER_ID, query);

            expect(notificationRepository.count).toHaveBeenCalledWith({ userId: USER_ID, isRead: true });
            expect(notificationRepository.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 10 }));
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
        });

        it('should respect string "false" for isRead filter', async () => {
            const query: any = { isRead: 'false' };
            notificationRepository.count.mockResolvedValue(0);
            notificationRepository.findMany.mockResolvedValue([]);

            await service.findAll(USER_ID, query);

            expect(notificationRepository.count).toHaveBeenCalledWith(expect.objectContaining({ isRead: false }));
        });

        it('should respect string "1" for isRead filter', async () => {
            const query: any = { isRead: '1' };
            notificationRepository.count.mockResolvedValue(0);
            notificationRepository.findMany.mockResolvedValue([]);

            await service.findAll(USER_ID, query);

            expect(notificationRepository.count).toHaveBeenCalledWith(expect.objectContaining({ isRead: true }));
        });

        it('should throw BadRequestException on repository error', async () => {
            notificationRepository.count.mockRejectedValue(new Error('DB Error'));
            await expect(service.findAll(USER_ID, { page: 1, limit: 10 })).rejects.toThrow(BadRequestException);
        });
    });

    describe('markAsRead', () => {
        it('should update and return notification as read', async () => {
            notificationRepository.findByIdAndUserId.mockResolvedValue(mockNotification);
            notificationRepository.update.mockResolvedValue({ ...mockNotification, isRead: true });

            const result = await service.markAsRead(NOTIFICATION_ID, USER_ID);

            expect(notificationRepository.update).toHaveBeenCalledWith(NOTIFICATION_ID, expect.objectContaining({ isRead: true }));
            expect(result.isRead).toBe(true);
        });

        it('should throw NotFoundException if notification does not exist for user', async () => {
            notificationRepository.findByIdAndUserId.mockResolvedValue(null);
            await expect(service.markAsRead(NOTIFICATION_ID, USER_ID)).rejects.toThrow(NotFoundException);
        });
    });

    describe('markAllAsRead', () => {
        it('should update all unread notifications for a user', async () => {
            notificationRepository.updateMany.mockResolvedValue({ count: 5 });

            const result = await service.markAllAsRead(USER_ID);

            expect(notificationRepository.updateMany).toHaveBeenCalledWith(
                { userId: USER_ID, isRead: false },
                expect.objectContaining({ isRead: true })
            );
            expect(result.count).toBe(5);
            expect(result.success).toBe(true);
        });
    });

    describe('getUnreadCount', () => {
        it('should return unread count', async () => {
            notificationRepository.count.mockResolvedValue(10);
            const result = await service.getUnreadCount(USER_ID);
            expect(result.count).toBe(10);
        });

        it('should throw BadRequestException on error', async () => {
            notificationRepository.count.mockRejectedValue(new Error('Fail'));
            await expect(service.getUnreadCount(USER_ID)).rejects.toThrow(BadRequestException);
        });
    });

    describe('create', () => {
        it('should create a notification', async () => {
            const dto: NotificationCreateDTO = {
                userId: USER_ID,
                title: 'T',
                message: 'M',
                notificationType: NotificationType.SYSTEM,
            };
            notificationRepository.create.mockResolvedValue({ ...mockNotification, ...dto });

            const result = await service.create(dto);

            expect(result.title).toBe('T');
            expect(notificationRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                sentVia: ['in_app']
            }));
        });

        it('should throw BadRequestException on error', async () => {
            notificationRepository.create.mockRejectedValue(new Error('Fail'));
            await expect(service.create({} as any)).rejects.toThrow(BadRequestException);
        });
    });

    describe('delete', () => {
        it('should delete existing notification', async () => {
            notificationRepository.findByIdAndUserId.mockResolvedValue(mockNotification);
            notificationRepository.delete.mockResolvedValue({ success: true });

            const result = await service.delete(NOTIFICATION_ID, USER_ID);

            expect(notificationRepository.delete).toHaveBeenCalledWith(NOTIFICATION_ID);
            expect(result.success).toBe(true);
        });

        it('should throw NotFoundException if notification missing', async () => {
            notificationRepository.findByIdAndUserId.mockResolvedValue(null);
            await expect(service.delete(NOTIFICATION_ID, USER_ID)).rejects.toThrow(NotFoundException);
        });
    });

    describe('handleCoursePublished', () => {
        it('should use wishlist fallback if userIds not provided', async () => {
            const payload = { courseId: COURSE_ID, courseTitle: 'Java', courseJlptLevel: 'N2' };
            prisma.$queryRaw.mockResolvedValue([{ user_id: 'u-1' }, { user_id: 'u-2' }]);

            await service.handleCoursePublished(payload);

            expect(prisma.$queryRaw).toHaveBeenCalled();
            expect(notificationRepository.createMany).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ userId: 'u-1', title: 'Khóa học mới đã được phát hành' })
            ]));
        });

        it('should skip if wishlist query fails', async () => {
            const payload = { courseId: COURSE_ID, courseTitle: 'Java', courseJlptLevel: 'N2' };
            prisma.$queryRaw.mockRejectedValue(new Error('Wishlist query failed'));

            await service.handleCoursePublished(payload);

            expect(notificationRepository.createMany).not.toHaveBeenCalled();
        });

        it('should skip if no users to notify', async () => {
            const payload = { courseId: COURSE_ID, courseTitle: 'Java', courseJlptLevel: 'N2', userIds: [] };
            await service.handleCoursePublished(payload);
            expect(notificationRepository.createMany).not.toHaveBeenCalled();
        });
    });

    describe('handleSendNotification', () => {
        it('should map COMMENT_REPLY to "comment" type', async () => {
            const payload = {
                recipientId: 'r1',
                type: 'COMMENT_REPLY' as const,
                payload: { title: 'T', body: 'B', metadata: {} }
            };

            await service.handleSendNotification(payload);

            expect(notificationRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'r1',
                notificationType: 'comment'
            }));
        });

        it('should map DAILY_SUMMARY to "blog_analytics" type', async () => {
            const payload = {
                recipientId: 'r1',
                type: 'DAILY_SUMMARY' as const,
                payload: { title: 'T', body: 'B', metadata: {} }
            };

            await service.handleSendNotification(payload);

            expect(notificationRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'r1',
                notificationType: 'blog_analytics'
            }));
        });
    });

    describe('handleCommentReply', () => {
        it('should skip if replying to self', async () => {
            await service.handleCommentReply({
                commentId: 'c1', blogId: 'b1', parentCommentId: 'p1',
                repliedToUserId: 'u1', replyAuthorId: 'u1', content: 'txt'
            });
            expect(notificationRepository.create).not.toHaveBeenCalled();
        });

        it('should skip if blog not found', async () => {
            prisma.blog.findUnique.mockResolvedValue(null);
            await service.handleCommentReply({
                commentId: 'c1', blogId: 'b1', parentCommentId: 'p1',
                repliedToUserId: 'u1', replyAuthorId: 'u2', content: 'txt'
            });
            expect(notificationRepository.create).not.toHaveBeenCalled();
        });

        it('should skip if recipient is blog owner (staff)', async () => {
            prisma.blog.findUnique.mockResolvedValue({ id: 'b1', authorId: 'u1' });
            await service.handleCommentReply({
                commentId: 'c1', blogId: 'b1', parentCommentId: 'p1',
                repliedToUserId: 'u1', replyAuthorId: 'u2', content: 'txt'
            });
            expect(notificationRepository.create).not.toHaveBeenCalled();
        });

        it('should notify user if valid reply (authorName fallback to email)', async () => {
            prisma.blog.findUnique.mockResolvedValue({ id: 'b1', authorId: 'staff-1', title: 'Blog' });
            prisma.user.findUnique.mockResolvedValue({ displayName: '', email: 'author@test.com' });

            await service.handleCommentReply({
                commentId: 'c1', blogId: 'b1', parentCommentId: 'p1',
                repliedToUserId: 'u1', replyAuthorId: 'u2', content: 'txt'
            });

            expect(notificationRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('author@test.com')
            }));
        });

        it('should notify user if valid reply (fallback to "Someone")', async () => {
            prisma.blog.findUnique.mockResolvedValue({ id: 'b1', authorId: 'staff-1', title: 'Blog' });
            prisma.user.findUnique.mockResolvedValue(null);

            await service.handleCommentReply({
                commentId: 'c1', blogId: 'b1', parentCommentId: 'p1',
                repliedToUserId: 'u1', replyAuthorId: 'u2', content: 'txt'
            });

            expect(notificationRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('Someone')
            }));
        });
    });

    describe('handleBlogInteractionStats', () => {
        it('should skip if zero interactions', async () => {
            await service.handleBlogInteractionStats({
                blogId: 'b1', blogTitle: 'T', authorId: 'a1', 
                commentCount: 0, likeCount: 0, viewCount: 0, date: 'now'
            });
            expect(notificationRepository.create).not.toHaveBeenCalled();
        });

        it('should notify author on interactions', async () => {
            await service.handleBlogInteractionStats({
                blogId: 'b1', blogTitle: 'T', authorId: 'a1', 
                commentCount: 5, likeCount: 5, viewCount: 10, date: 'now'
            });
            expect(notificationRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'a1',
                notificationType: 'blog_analytics'
            }));
        });
    });
});
