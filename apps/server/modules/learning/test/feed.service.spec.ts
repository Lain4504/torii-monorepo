// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { FeedService } from '@server/learning/modules/feed/feed/feed.service';
import { FeedRepository } from '@server/learning/modules/feed/feed/feed.repository';
import { PrismaService } from '@server/shared';
import { getMapperToken } from '@automapper/nestjs';
import { NotFoundException } from '@nestjs/common';

describe('FeedService', () => {
    let service: FeedService;
    let feedRepository: any;
    let prismaService: any;
    let mapper: any;

    const mockFeedRepository = {
        create: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const mockPrismaService = {
        feedUserLike: {
            count: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
            create: jest.fn(),
        },
    };

    const mockMapper = {
        map: jest.fn().mockImplementation((val) => val),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FeedService,
                { provide: FeedRepository, useValue: mockFeedRepository },
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: getMapperToken(), useValue: mockMapper },
            ],
        }).compile();

        service = module.get<FeedService>(FeedService);
        feedRepository = module.get(FeedRepository);
        prismaService = module.get(PrismaService);
        mapper = module.get(getMapperToken());

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createFeed', () => {
        it('should create a feed and return the response DTO', async () => {
            const dto = { title: 'Test Feed', content: 'Content', tags: ['tag1'] };
            const userId = 'user-1';
            const createdFeed = {
                id: 'feed-1',
                ...dto,
                authorId: userId,
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                author: { id: userId, displayName: 'User', avatarUrl: 'url' },
            };

            mockFeedRepository.create.mockResolvedValue({ id: 'feed-1' });
            mockFeedRepository.findById.mockResolvedValue(createdFeed);

            const result = await service.createFeed(userId, dto);

            expect(feedRepository.create).toHaveBeenCalledWith({
                title: dto.title,
                content: dto.content,
                tags: dto.tags,
                author: { connect: { id: userId } },
            });
            expect(result.id).toEqual(createdFeed.id);
            expect(result.title).toEqual(createdFeed.title);
        });
    });

    describe('findAllFeeds', () => {
        it('should return paginated feeds with correct filters', async () => {
            const query = { page: 1, limit: 10, search: 'test', tags: ['tag1'] };
            const feeds = [
                {
                    id: 'feed-1',
                    title: 'Test Feed',
                    content: 'Content',
                    authorId: 'user-1',
                    tags: ['tag1'],
                    viewCount: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    author: { id: 'user-1', displayName: 'User', avatarUrl: 'url' },
                },
            ];
            const total = 1;

            mockFeedRepository.findAll.mockResolvedValue(feeds);
            mockFeedRepository.count.mockResolvedValue(total);
            mockPrismaService.feedUserLike.count.mockResolvedValue(0);

            const result = await service.findAllFeeds(query as any, 'user-1');

            expect(feedRepository.findAll).toHaveBeenCalledWith(expect.objectContaining({
                skip: 0,
                take: 10,
                where: expect.objectContaining({
                    OR: [
                        { title: { contains: 'test', mode: 'insensitive' } },
                        { content: { contains: 'test', mode: 'insensitive' } },
                    ],
                }),
            }));
            expect(result.data.length).toEqual(1);
            expect(result.total).toEqual(total);
        });

        it('should handle sorting by likes', async () => {
            const query = { sortBy: 'likes', sortOrder: 'asc' };
            mockFeedRepository.findAll.mockResolvedValue([]);
            mockFeedRepository.count.mockResolvedValue(0);

            await service.findAllFeeds(query as any);

            expect(feedRepository.findAll).toHaveBeenCalledWith(expect.objectContaining({
                orderBy: { likeCount: 'asc' },
            }));
        });
    });

    describe('findFeedById', () => {
        it('should return a feed if found and increment view count', async () => {
            const feed = {
                id: 'feed-1',
                title: 'Test Feed',
                content: 'Content',
                authorId: 'user-1',
                tags: [],
                viewCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockFeedRepository.findById.mockResolvedValue(feed);
            mockPrismaService.feedUserLike.count.mockResolvedValue(1);

            const result = await service.findFeedById('feed-1', 'user-1');

            expect(feedRepository.findById).toHaveBeenCalledWith('feed-1');
            expect(feedRepository.update).toHaveBeenCalledWith('feed-1', { viewCount: { increment: 1 } });
            expect(result.id).toEqual(feed.id);
            expect(result.isLiked).toBe(true);
        });

        it('should throw NotFoundException if feed not found', async () => {
            mockFeedRepository.findById.mockResolvedValue(null);

            await expect(service.findFeedById('feed-1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('toggleLike', () => {
        it('should unlike if already liked', async () => {
            mockPrismaService.feedUserLike.findUnique.mockResolvedValue({ id: 1 });
            mockPrismaService.feedUserLike.count.mockResolvedValue(0);

            const result = await service.toggleLike('feed-1', 'user-1');

            expect(prismaService.feedUserLike.delete).toHaveBeenCalled();
            expect(feedRepository.update).toHaveBeenCalledWith('feed-1', { likeCount: { decrement: 1 } });
            expect(result.isLiked).toBe(false);
        });

        it('should like if not liked yet', async () => {
            mockPrismaService.feedUserLike.findUnique.mockResolvedValue(null);
            mockPrismaService.feedUserLike.count.mockResolvedValue(1);

            const result = await service.toggleLike('feed-1', 'user-1');

            expect(prismaService.feedUserLike.create).toHaveBeenCalled();
            expect(feedRepository.update).toHaveBeenCalledWith('feed-1', { likeCount: { increment: 1 } });
            expect(result.isLiked).toBe(true);
        });
    });

    describe('deleteFeed', () => {
        it('should delete feed if user is author', async () => {
            const feed = { id: 'feed-1', authorId: 'user-1' };
            mockFeedRepository.findById.mockResolvedValue(feed);

            const result = await service.deleteFeed('feed-1', 'user-1');

            expect(feedRepository.delete).toHaveBeenCalledWith('feed-1');
            expect(result).toBe(true);
        });

        it('should throw NotFoundException if feed does not exist', async () => {
            mockFeedRepository.findById.mockResolvedValue(null);

            await expect(service.deleteFeed('feed-1', 'user-1')).rejects.toThrow(NotFoundException);
        });

        it('should throw Error if user is not author', async () => {
            const feed = { id: 'feed-1', authorId: 'author-1' };
            mockFeedRepository.findById.mockResolvedValue(feed);

            await expect(service.deleteFeed('feed-1', 'user-1')).rejects.toThrow('Unauthorized to delete this Feed');
        });
    });
});
