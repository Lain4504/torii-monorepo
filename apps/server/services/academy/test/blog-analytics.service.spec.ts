import { Test, TestingModule } from '@nestjs/testing';
import { BlogAnalyticsService } from '../src/modules/blog/blog-analytics.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';

describe('BlogAnalyticsService', () => {
  let service: BlogAnalyticsService;
  let prisma: any;
  let natsClient: any;

  beforeEach(async () => {
    prisma = {
      blog: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      comment: {
        count: jest.fn().mockResolvedValue(0),
      },
      $queryRaw: jest.fn().mockResolvedValue([]),
    };

    natsClient = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogAnalyticsService,
        { provide: PrismaService, useValue: prisma },
        { provide: 'NATS_SERVICE', useValue: natsClient },
      ],
    }).compile();

    service = module.get<BlogAnalyticsService>(BlogAnalyticsService);
  });

  describe('generateDailyBlogInteractionStats', () => {
    it('should send notifications for blogs with new comments', async () => {
      const mockBlog = {
        id: 'b1',
        title: 'Test Blog',
        authorId: 'a1',
        publishedAt: new Date(Date.now() - 86400000), // Yesterday
      };
      prisma.blog.findMany.mockResolvedValue([mockBlog]);
      prisma.$queryRaw.mockResolvedValue([]); // No existing notification
      prisma.comment.count.mockResolvedValue(5);

      await service.generateDailyBlogInteractionStats();

      expect(natsClient.emit).toHaveBeenCalledWith(
        { cmd: 'send_notification' },
        expect.objectContaining({
          recipientId: 'a1',
          payload: expect.objectContaining({
            metadata: expect.objectContaining({
              commentCount: 5,
            }),
          }),
        }),
      );
    });

    it('should skip if notification already exists', async () => {
      prisma.blog.findMany.mockResolvedValue([{ id: 'b1', authorId: 'a1', publishedAt: new Date() }]);
      prisma.$queryRaw.mockResolvedValue([{ id: 'notif1' }]);

      await service.generateDailyBlogInteractionStats();

      expect(prisma.comment.count).not.toHaveBeenCalled();
      expect(natsClient.emit).not.toHaveBeenCalled();
    });
  });
});
