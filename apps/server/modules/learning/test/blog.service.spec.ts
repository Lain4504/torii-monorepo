import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from '@server/learning/modules/blog/blog.service';
import { BlogRepository } from '@server/learning/modules/blog/blog.repository';
import { PrismaService, REDIS_CLIENT } from '@server/shared';
import { getMapperToken } from '@automapper/nestjs';
import { BlogStatus } from '@workspace/schemas';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BlogService', () => {
    let service: BlogService;
    let repository: BlogRepository;
    let prisma: PrismaService;
    let redis: any;
    let mapper: any;

    const mockBlog = {
        id: 'blog-1',
        title: 'Test Blog',
        slug: 'test-blog-2026-02-08',
        excerpt: 'Test Excerpt',
        content: 'Test Content',
        coverImageUrl: 'auth-1',
        authorId: 'user-1',
        status: BlogStatus.DRAFT,
        publishedAt: null,
        tags: [],
        seoTitle: 'SEO Title',
        seoDescription: 'SEO Description',
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
    };

    // Define mock objects as variables to be reset
    let mockBlogRepository: any;
    let mockPrismaService: any;
    let mockMapper: any;
    let mockRedis: any;

    beforeEach(async () => {
        mockBlogRepository = {
            create: jest.fn().mockResolvedValue(mockBlog),
            findMany: jest.fn().mockResolvedValue([mockBlog]),
            count: jest.fn().mockResolvedValue(1),
            findById: jest.fn().mockResolvedValue(mockBlog),
            findBySlug: jest.fn().mockResolvedValue(mockBlog),
            update: jest.fn().mockResolvedValue(mockBlog),
            delete: jest.fn().mockResolvedValue(undefined),
            slugExists: jest.fn().mockResolvedValue(false),
            incrementViewCount: jest.fn().mockResolvedValue(undefined),
        };

        mockPrismaService = {
            user: {
                findUnique: jest.fn().mockResolvedValue(mockUser),
            },
        };

        mockMapper = {
            map: jest.fn().mockReturnValue(mockBlog),
        };

        mockRedis = {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue('OK'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BlogService,
                {
                    provide: BlogRepository,
                    useValue: mockBlogRepository,
                },
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: getMapperToken(),
                    useValue: mockMapper,
                },
                {
                    provide: REDIS_CLIENT,
                    useValue: mockRedis,
                },
            ],
        }).compile();

        service = module.get<BlogService>(BlogService);
        repository = module.get<BlogRepository>(BlogRepository);
        prisma = module.get<PrismaService>(PrismaService);
        redis = module.get(REDIS_CLIENT);
        mapper = module.get(getMapperToken());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createBlog', () => {
        const createDto = {
            title: 'Test Blog',
            excerpt: 'Test Excerpt',
            content: 'Test Content',
            authorId: 'user-1',
        };

        it('should create a blog successfully', async () => {
            const result = await service.createBlog(createDto);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
            expect(repository.create).toHaveBeenCalled();
            expect(mapper.map).toHaveBeenCalled();
            expect(result).toEqual(mockBlog);
        });

        it('should throw BadRequestException if authorId is missing', async () => {
            await expect(service.createBlog({ ...createDto, authorId: undefined } as any))
                .rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if author does not exist', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.createBlog(createDto))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('findAllBlogs', () => {
        it('should return paginated blogs', async () => {
            const query = { page: 1, limit: 10 };
            const result = await service.findAllBlogs(query);

            expect(repository.findMany).toHaveBeenCalled();
            expect(repository.count).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
        });
    });

    describe('findBlogById', () => {
        it('should return a blog if it exists', async () => {
            const result = await service.findBlogById('blog-1');
            expect(repository.findById).toHaveBeenCalledWith('blog-1');
            expect(result).toEqual(mockBlog);
        });

        it('should throw NotFoundException if blog does not exist', async () => {
            (repository.findById as jest.Mock).mockResolvedValue(null);
            await expect(service.findBlogById('non-existent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('incrementViewCount', () => {
        it('should increment view count and throttle if IP is provided', async () => {
            await service.incrementViewCount('blog-1', '127.0.0.1');

            expect(redis.get).toHaveBeenCalled();
            expect(redis.set).toHaveBeenCalled();
            expect(repository.incrementViewCount).toHaveBeenCalledWith('blog-1');
        });

        it('should not increment if throttled', async () => {
            redis.get.mockResolvedValue('1');
            await service.incrementViewCount('blog-1', '127.0.0.1');

            expect(repository.incrementViewCount).not.toHaveBeenCalled();
        });
    });

    describe('updateBlog', () => {
        it('should update a blog successfully', async () => {
            const updateDto = { title: 'Updated Title' };
            const result = await service.updateBlog('blog-1', updateDto);

            expect(repository.findById).toHaveBeenCalledWith('blog-1');
            expect(repository.update).toHaveBeenCalled();
            expect(result).toEqual(mockBlog);
        });

        it('should throw NotFoundException if blog does not exist', async () => {
            (repository.findById as jest.Mock).mockResolvedValue(null);
            await expect(service.updateBlog('non-existent', {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('publishBlog', () => {
        it('should publish a blog successfully', async () => {
            const result = await service.publishBlog('blog-1');

            expect(repository.update).toHaveBeenCalledWith('blog-1', expect.objectContaining({
                status: BlogStatus.PUBLISHED,
            }));
            expect(result).toEqual(mockBlog);
        });

        it('should throw BadRequestException if blog is already published', async () => {
            (repository.findById as jest.Mock).mockResolvedValue({ ...mockBlog, status: BlogStatus.PUBLISHED });
            await expect(service.publishBlog('blog-1')).rejects.toThrow(BadRequestException);
        });
    });

    describe('deleteBlog', () => {
        it('should delete a blog successfully', async () => {
            const result = await service.deleteBlog('blog-1');
            expect(repository.delete).toHaveBeenCalledWith('blog-1');
            expect(result).toEqual({ success: true });
        });

        it('should throw NotFoundException if blog does not exist', async () => {
            (repository.findById as jest.Mock).mockResolvedValue(null);
            await expect(service.deleteBlog('non-existent')).rejects.toThrow(NotFoundException);
        });
    });
});
