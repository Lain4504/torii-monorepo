
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from '@server/learning/modules/review/review.service';
import { ReviewRepository } from '@server/learning/modules/review/review.repository';
import { RpcException } from '@nestjs/microservices';
import { getMapperToken } from '@automapper/nestjs';
import { ENROLLMENT_REPOSITORY_TOKEN } from '@server/learning/interfaces';
import type { ReviewCreateDTO, ReviewQueryDTO } from '@workspace/schemas';

// Mock ReviewRepository
const mockReviewRepository = {
    count: jest.fn(),
    findMany: jest.fn(),
    countByCourseId: jest.fn(),
    findManyByCourseId: jest.fn(),
    findAllByCourseId: jest.fn(),
    findCourse: jest.fn(),
    findByUserAndCourse: jest.fn(),
    create: jest.fn(),
    updateCourseRatingStats: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
};

const mockEnrollmentRepository = {
    findByUserAndCourse: jest.fn(),
};

const mockMapper = {
    map: jest.fn().mockImplementation((val) => val),
};

describe('ReviewService', () => {
    let service: ReviewService;
    let repository: typeof mockReviewRepository;
    let enrollmentRepository: typeof mockEnrollmentRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewService,
                {
                    provide: ReviewRepository,
                    useValue: mockReviewRepository,
                },
                {
                    provide: ENROLLMENT_REPOSITORY_TOKEN,
                    useValue: mockEnrollmentRepository,
                },
                {
                    provide: getMapperToken(),
                    useValue: mockMapper,
                },
            ],
        }).compile();

        service = module.get<ReviewService>(ReviewService);
        repository = module.get(ReviewRepository);
        enrollmentRepository = module.get(ENROLLMENT_REPOSITORY_TOKEN);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated reviews', async () => {
            const query = { page: 1, limit: 10, search: 'test' };
            const expectedReviews = [
                {
                    id: '1',
                    userId: 'user1',
                    courseId: 'course1',
                    rating: 5,
                    user: { id: 'user1', displayName: 'User 1' },
                    course: { title: 'Course 1', slug: 'course-1' },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            const expectedTotal = 1;

            mockReviewRepository.count.mockResolvedValue(expectedTotal);
            mockReviewRepository.findMany.mockResolvedValue(expectedReviews);

            const result = await service.findAll(query);

            expect(repository.count).toHaveBeenCalled();
            expect(repository.findMany).toHaveBeenCalled();
            expect(result).toEqual({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        id: '1',
                        courseTitle: 'Course 1',
                        courseSlug: 'course-1',
                    }),
                ]),
                total: expectedTotal,
                page: 1,
                limit: 10,
                totalPages: 1,
            });
        });

        it('should handle errors gracefully', async () => {
            mockReviewRepository.findMany.mockRejectedValue(new Error('DB Error'));
            const result = await service.findAll({});
            expect(result.data).toEqual([]);
            expect(result.total).toBe(0);
        });
    });

    describe('findByCourseId', () => {
        it('should return reviews for a specific course', async () => {
            const courseId = 'course1';
            const query: ReviewQueryDTO = { page: 1, limit: 10, courseId };
            const expectedReviews = [
                {
                    id: '1',
                    userId: 'user1',
                    courseId: 'course1',
                    rating: 4,
                    user: { id: 'user1', displayName: 'User 1' },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            mockReviewRepository.countByCourseId.mockResolvedValue(1);
            mockReviewRepository.findManyByCourseId.mockResolvedValue(expectedReviews);

            const result = await service.findByCourseId(courseId, query);

            expect(repository.countByCourseId).toHaveBeenCalledWith(courseId);
            expect(repository.findManyByCourseId).toHaveBeenCalledWith(expect.objectContaining({ courseId }));
            expect(result.data).toHaveLength(1);
            expect(result.data[0].id).toBe('1');
        });
    });

    describe('getRatingDistribution', () => {
        it('should calculate rating distribution correctly', async () => {
            const courseId = 'course1';
            const reviews = [
                { rating: 5 },
                { rating: 5 },
                { rating: 4 },
                { rating: 1 },
            ];

            mockReviewRepository.findAllByCourseId.mockResolvedValue(reviews);

            const result = await service.getRatingDistribution(courseId);

            expect(result.totalReviews).toBe(4);
            expect(result.averageRating).toBe(3.75); // (5+5+4+1)/4 = 15/4 = 3.75
            expect(result.distribution).toHaveLength(5);

            // Check 5 stars (2 reviews, 50%)
            const fiveStars = result.distribution.find(d => d.stars === 5);
            expect(fiveStars?.count).toBe(2);
            expect(fiveStars?.percent).toBe(50);
        });

        it('should return empty distribution if error occurs', async () => {
            mockReviewRepository.findAllByCourseId.mockRejectedValue(new Error('DB Error'));
            const result = await service.getRatingDistribution('course1');
            expect(result.totalReviews).toBe(0);
            expect(result.averageRating).toBe(0);
        });
    });

    describe('create', () => {
        const userId = 'user1';
        const courseId = 'course1';
        const createDto: ReviewCreateDTO = { rating: 5, comment: 'Great course' };

        it('should create a review successfully', async () => {
            mockReviewRepository.findCourse.mockResolvedValue({ id: courseId });
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue({ id: 'enr1' });
            mockReviewRepository.findByUserAndCourse.mockResolvedValue(null);
            mockReviewRepository.create.mockResolvedValue({
                id: 'review1',
                userId,
                courseId,
                rating: 5,
                comment: 'Great course',
                user: { id: userId, displayName: 'User 1' },
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            // Mock stats update dependencies
            mockReviewRepository.findAllByCourseId.mockResolvedValue([{ rating: 5 }]);
            mockReviewRepository.updateCourseRatingStats.mockResolvedValue(undefined);

            const result = await service.create(userId, courseId, createDto);

            expect(repository.findCourse).toHaveBeenCalledWith(courseId);
            expect(repository.findByUserAndCourse).toHaveBeenCalledWith(userId, courseId);
            expect(repository.create).toHaveBeenCalled();
            expect(repository.updateCourseRatingStats).toHaveBeenCalled();
            expect(result.id).toBe('review1');
        });

        it('should throw if user not enrolled', async () => {
            mockReviewRepository.findCourse.mockResolvedValue({ id: courseId });
            mockEnrollmentRepository.findByUserAndCourse.mockResolvedValue(null);

            await expect(service.create(userId, courseId, createDto))
                .rejects.toThrow(RpcException); // 403
        });

        it('should throw if course not found', async () => {
            mockReviewRepository.findCourse.mockResolvedValue(null);

            await expect(service.create(userId, courseId, createDto))
                .rejects.toThrow(RpcException); // 404
        });

        it('should throw if user already reviewed', async () => {
            mockReviewRepository.findCourse.mockResolvedValue({ id: courseId });
            mockReviewRepository.findByUserAndCourse.mockResolvedValue({ id: 'existing' });

            await expect(service.create(userId, courseId, createDto))
                .rejects.toThrow(RpcException); // 400
        });
    });

    describe('findById', () => {
        it('should return a review if found', async () => {
            const reviewId = 'review1';
            const mockReview = {
                id: reviewId,
                userId: 'user1',
                courseId: 'course1',
                rating: 5,
                user: { id: 'user1', displayName: 'User 1' },
                course: { title: 'Test Course' },
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockReviewRepository.findById.mockResolvedValue(mockReview);

            const result = await service.findById(reviewId);

            expect(repository.findById).toHaveBeenCalledWith(reviewId, true);
            expect(result.id).toBe(reviewId);
            expect(result.courseTitle).toBe('Test Course');
        });

        it('should throw 404 if review not found', async () => {
            mockReviewRepository.findById.mockResolvedValue(null);

            await expect(service.findById('non-existent'))
                .rejects.toThrow(RpcException);
        });
    });

    describe('delete', () => {
        const reviewId = 'review1';
        const userId = 'user1';
        const courseId = 'course1';

        it('should delete review successfully', async () => {
            mockReviewRepository.findById.mockResolvedValue({
                id: reviewId,
                userId: userId,
                courseId: courseId,
            });
            mockReviewRepository.delete.mockResolvedValue(true);

            // Mock stats update
            mockReviewRepository.findAllByCourseId.mockResolvedValue([]);
            mockReviewRepository.updateCourseRatingStats.mockResolvedValue(undefined);

            const result = await service.delete(reviewId, userId);

            expect(repository.findById).toHaveBeenCalledWith(reviewId);
            expect(repository.delete).toHaveBeenCalledWith(reviewId);
            expect(repository.updateCourseRatingStats).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('should throw 404 if review not found', async () => {
            mockReviewRepository.findById.mockResolvedValue(null);

            await expect(service.delete(reviewId, userId))
                .rejects.toThrow(RpcException);
        });

        it('should throw 403 if user does not own the review', async () => {
            mockReviewRepository.findById.mockResolvedValue({
                id: reviewId,
                userId: 'other-user',
                courseId: courseId,
            });

            await expect(service.delete(reviewId, userId))
                .rejects.toThrow(RpcException);
        });
    });
});
