import { Test, TestingModule } from '@nestjs/testing';
import { WishlistService } from '@server/learning/modules/wishlist/wishlist.service';
import { WishlistRepository } from '@server/learning/modules/wishlist/wishlist.repository';
import { getMapperToken } from '@automapper/nestjs';
import type { WishlistCreateDTO, WishlistQueryDTO } from '@workspace/schemas';

const mockMapper = {
  map: jest.fn().mockImplementation((val) => val),
};

describe('WishlistService', () => {
  let service: WishlistService;
  let repository: jest.Mocked<WishlistRepository>;

  // Mock Data
  const mockUserId = 'user-123';
  const mockCourseId = 'course-456';
  const mockWishlistId = 'wishlist-789';
  const mockDate = new Date('2024-01-01');

  const mockWishlist = {
    id: mockWishlistId,
    userId: mockUserId,
    courseId: mockCourseId,
    addedAt: mockDate,
  };

  const mockWishlistResponse = {
    id: mockWishlistId,
    userId: mockUserId,
    courseId: mockCourseId,
    addedAt: mockDate,
  };

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      findByUserAndCourse: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: WishlistRepository,
          useValue: mockRepository,
        },
        {
          provide: getMapperToken(),
          useValue: mockMapper,
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    repository = module.get(WishlistRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated wishlists with default pagination', async () => {
      const query: WishlistQueryDTO = { page: 1, limit: 10 };
      const expectedTotal = 1;

      repository.count.mockResolvedValue(expectedTotal);
      repository.findMany.mockResolvedValue([mockWishlist]);

      const result = await service.findAll(query);

      expect(repository.count).toHaveBeenCalledWith({});
      expect(repository.findMany).toHaveBeenCalledWith({
        where: {},
        take: 10,
        skip: 0,
        orderBy: { addedAt: 'desc' },
      });

      expect(result).toEqual({
        data: [mockWishlistResponse],
        total: expectedTotal,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter by userId and courseId', async () => {
      const query: WishlistQueryDTO = {
        page: 1,
        limit: 10,
        userId: mockUserId,
        courseId: mockCourseId,
      };

      repository.count.mockResolvedValue(1);
      repository.findMany.mockResolvedValue([mockWishlist]);

      await service.findAll(query);

      const expectedWhere = {
        userId: mockUserId,
        courseId: mockCourseId,
      };

      expect(repository.count).toHaveBeenCalledWith(expectedWhere);
      expect(repository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
        }),
      );
    });

    it('should return empty result on error', async () => {
      repository.count.mockRejectedValue(new Error('Database error'));

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('findById', () => {
    it('should return a wishlist by ID', async () => {
      repository.findById.mockResolvedValue(mockWishlist);

      const result = await service.findById(mockWishlistId);

      expect(repository.findById).toHaveBeenCalledWith(mockWishlistId);
      expect(result).toEqual(mockWishlistResponse);
    });

    it('should return null if wishlist not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById(mockWishlistId);

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      repository.findById.mockRejectedValue(new Error('Database error'));

      const result = await service.findById(mockWishlistId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createInput: WishlistCreateDTO = {
      userId: mockUserId,
      courseId: mockCourseId,
    };

    it('should create a new wishlist successfully', async () => {
      repository.create.mockResolvedValue(mockWishlist);

      const result = await service.create(createInput);

      expect(repository.create).toHaveBeenCalledWith({
        user: { connect: { id: mockUserId } },
        course: { connect: { id: mockCourseId } },
      });
      expect(result).toEqual(mockWishlistResponse);
    });

    it('should throw error if userId is missing', async () => {
      await expect(
        service.create({ ...createInput, userId: undefined as any }),
      ).rejects.toThrow('UserId is required');
    });

    it('should throw error if courseId is missing', async () => {
      await expect(
        service.create({ ...createInput, courseId: undefined as any }),
      ).rejects.toThrow('CourseId is required');
    });

    it('should return existing wishlist if P2002 error occurs', async () => {
      const p2002Error: any = new Error('Unique constraint failed');
      p2002Error.code = 'P2002';

      repository.create.mockRejectedValue(p2002Error);
      repository.findByUserAndCourse.mockResolvedValue(mockWishlist);

      const result = await service.create(createInput);

      expect(repository.findByUserAndCourse).toHaveBeenCalledWith(
        mockUserId,
        mockCourseId,
      );
      expect(result).toEqual(mockWishlistResponse);
    });

    it('should throw error for other database errors', async () => {
      repository.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createInput)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('delete', () => {
    it('should delete a wishlist successfully', async () => {
      repository.findById.mockResolvedValue(mockWishlist);
      repository.delete.mockResolvedValue(undefined);

      const result = await service.delete(mockWishlistId);

      expect(repository.findById).toHaveBeenCalledWith(mockWishlistId);
      expect(repository.delete).toHaveBeenCalledWith(mockWishlistId);
      expect(result).toBe(true);
    });

    it('should return false if wishlist not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.delete(mockWishlistId);

      expect(repository.delete).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      repository.findById.mockRejectedValue(new Error('Database error'));

      const result = await service.delete(mockWishlistId);

      expect(result).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should add to wishlist if not exists', async () => {
      repository.findByUserAndCourse.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockWishlist);

      const result = await service.toggle(mockUserId, mockCourseId);

      expect(repository.findByUserAndCourse).toHaveBeenCalledWith(
        mockUserId,
        mockCourseId,
      );
      expect(repository.create).toHaveBeenCalledWith({
        user: { connect: { id: mockUserId } },
        course: { connect: { id: mockCourseId } },
      });
      expect(result).toEqual({
        isInWishlist: true,
        wishlist: mockWishlistResponse,
      });
    });

    it('should remove from wishlist if exists', async () => {
      repository.findByUserAndCourse.mockResolvedValue(mockWishlist);
      repository.delete.mockResolvedValue(undefined);

      const result = await service.toggle(mockUserId, mockCourseId);

      expect(repository.findByUserAndCourse).toHaveBeenCalledWith(
        mockUserId,
        mockCourseId,
      );
      expect(repository.delete).toHaveBeenCalledWith(mockWishlistId);
      expect(result).toEqual({
        isInWishlist: false,
      });
    });

    it('should throw error on database error', async () => {
      repository.findByUserAndCourse.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.toggle(mockUserId, mockCourseId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('isInWishlist', () => {
    it('should return true if wishlist exists', async () => {
      repository.findByUserAndCourse.mockResolvedValue(mockWishlist);

      const result = await service.isInWishlist(mockUserId, mockCourseId);

      expect(repository.findByUserAndCourse).toHaveBeenCalledWith(
        mockUserId,
        mockCourseId,
      );
      expect(result).toBe(true);
    });

    it('should return false if wishlist does not exist', async () => {
      repository.findByUserAndCourse.mockResolvedValue(null);

      const result = await service.isInWishlist(mockUserId, mockCourseId);

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      repository.findByUserAndCourse.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.isInWishlist(mockUserId, mockCourseId);

      expect(result).toBe(false);
    });
  });
});
