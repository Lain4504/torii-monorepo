import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from '../src/modules/blog/blog.service';
import { BlogRepository } from '../src/modules/blog/blog.repository';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';

describe('BlogService', () => {
  let service: BlogService;
  let repo: any;

  beforeEach(async () => {
    repo = {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      slugExists: jest.fn().mockResolvedValue(false),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        { provide: BlogRepository, useValue: repo },
        { provide: PrismaService, useValue: { user: { findUnique: jest.fn() } } },
        { provide: AuditLoggerService, useValue: { log: jest.fn() } },
        { provide: 'automapper:nestjs:default', useValue: { map: jest.fn(), mapArray: jest.fn() } },
        { provide: 'REDIS_CLIENT', useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
  });

  describe('findAllBlogs Exhaustive', () => {
    it('should return paginated blogs', async () => {
      const result = await service.findAllBlogs({});
      expect(result.data).toEqual([]);
    });
  });

  describe('createBlog and unique slugs', () => {
    it('should create blog successfully', async () => {
      (service as any).prisma.user.findUnique.mockResolvedValueOnce({ id: 'u1' });
      repo.create.mockResolvedValueOnce({ id: 'b1', title: 'T' });
      await service.createBlog({ title: 'T', content: 'C', authorId: 'u1' } as any);
      expect(repo.create).toHaveBeenCalled();
    });
  });
});
