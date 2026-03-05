import { Test, TestingModule } from '@nestjs/testing';
import { BlogAnalyticsService } from '@server/learning/modules/blog/blog-analytics.service';
import { PrismaService } from '@server/shared';

describe('BlogAnalyticsService', () => {
  let service: BlogAnalyticsService;
  let prisma: PrismaService;
  let natsClient: any;

  const mockBlog = {
    id: 'blog-1',
    title: 'Test Blog',
    authorId: 'author-1',
    publishedAt: new Date(Date.now() - 86400000), // Yesterday
    status: 'published',
  };

  const mockPrismaService = {
    blog: {
      findMany: jest.fn(),
    },
    comment: {
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  const mockNatsClient = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogAnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'NATS_SERVICE',
          useValue: mockNatsClient,
        },
      ],
    }).compile();

    service = module.get<BlogAnalyticsService>(BlogAnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
    natsClient = module.get('NATS_SERVICE');

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateDailyBlogInteractionStats', () => {
    it('should send notifications for blogs with interactions', async () => {
      mockPrismaService.blog.findMany.mockResolvedValue([mockBlog]);
      mockPrismaService.$queryRaw.mockResolvedValue([]); // No existing notification
      mockPrismaService.comment.count.mockResolvedValue(5); // 5 comments

      await service.generateDailyBlogInteractionStats();

      expect(mockPrismaService.blog.findMany).toHaveBeenCalled();
      expect(mockPrismaService.comment.count).toHaveBeenCalled();
      expect(mockNatsClient.emit).toHaveBeenCalledWith(
        { cmd: 'send_notification' },
        expect.objectContaining({ recipientId: 'author-1' }),
      );
    });

    it('should skip blogs with no interactions', async () => {
      mockPrismaService.blog.findMany.mockResolvedValue([mockBlog]);
      mockPrismaService.$queryRaw.mockResolvedValue([]);
      mockPrismaService.comment.count.mockResolvedValue(0); // 0 comments

      await service.generateDailyBlogInteractionStats();

      expect(mockNatsClient.emit).not.toHaveBeenCalled();
    });

    it('should skip if notification already exists', async () => {
      mockPrismaService.blog.findMany.mockResolvedValue([mockBlog]);
      mockPrismaService.$queryRaw.mockResolvedValue([{ id: 'notif-1' }]); // Exists

      await service.generateDailyBlogInteractionStats();

      expect(mockPrismaService.comment.count).not.toHaveBeenCalled();
      expect(mockNatsClient.emit).not.toHaveBeenCalled();
    });

    it('should gracefully handle errors during processing of a single blog', async () => {
      mockPrismaService.blog.findMany.mockResolvedValue([
        mockBlog,
        { ...mockBlog, id: 'blog-2' },
      ]);
      mockPrismaService.$queryRaw.mockRejectedValueOnce(
        new Error('Internal Error'),
      );
      mockPrismaService.$queryRaw.mockResolvedValue([]);
      mockPrismaService.comment.count.mockResolvedValue(3);

      await service.generateDailyBlogInteractionStats();

      // Should still process the second blog if the first one fails
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(2);
      expect(mockNatsClient.emit).toHaveBeenCalledTimes(1);
    });
  });
});
