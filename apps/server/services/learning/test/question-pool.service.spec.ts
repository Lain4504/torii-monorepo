import { Test, TestingModule } from '@nestjs/testing';
import { QuestionPoolService } from '@server/learning/modules/question-pool/question-pool.service';
import { QUESTION_POOL_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-question-pool.repository';
import { getMapperToken } from '@automapper/nestjs';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@workspace/schemas';

describe('QuestionPoolService', () => {
    let service: QuestionPoolService;
    let poolRepository: any;
    let mapper: any;

    const mockPool = {
        id: 'pool-1',
        name: 'Test Pool',
        description: 'Desc',
        courseId: 'course-1',
    };

    const mockRequester = {
        sub: 'staff-1',
        role: UserRole.STAFF,
        permissions: ['exam.manage'],
    };

    const mockQuestionPoolRepository = {
        findById: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findByCourse: jest.fn(),
        findByLesson: jest.fn(),
        findByJlptLevel: jest.fn(),
    };

    const mockMapper = {
        map: jest.fn().mockImplementation((val) => (val ? { ...val } : val)),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuestionPoolService,
                {
                    provide: QUESTION_POOL_REPOSITORY_TOKEN,
                    useValue: mockQuestionPoolRepository,
                },
                {
                    provide: getMapperToken(),
                    useValue: mockMapper,
                },
            ],
        }).compile();

        service = module.get<QuestionPoolService>(QuestionPoolService);
        poolRepository = module.get(QUESTION_POOL_REPOSITORY_TOKEN);
        mapper = module.get(getMapperToken());

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated pools', async () => {
            mockQuestionPoolRepository.count.mockResolvedValue(1);
            mockQuestionPoolRepository.findMany.mockResolvedValue([mockPool]);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
        });
    });

    describe('create', () => {
        it('should create a pool successfully', async () => {
            mockQuestionPoolRepository.create.mockResolvedValue(mockPool);

            const result = await service.create(mockRequester as any, {
                name: 'New Pool',
            });

            expect(result.id).toBe(mockPool.id);
            expect(poolRepository.create).toHaveBeenCalled();
        });

        it('should throw ForbiddenException if missing permission', async () => {
            const requester = { sub: 'u-1', permissions: [] };
            await expect(service.create(requester as any, { name: 'P' } as any))
                .rejects.toThrow(ForbiddenException);
        });
    });

    describe('delete', () => {
        it('should delete pool if exists', async () => {
            mockQuestionPoolRepository.findById.mockResolvedValue(mockPool);
            await service.delete(mockRequester as any, 'pool-1');
            expect(poolRepository.delete).toHaveBeenCalledWith('pool-1');
        });

        it('should throw NotFoundException if pool not found', async () => {
            mockQuestionPoolRepository.findById.mockResolvedValue(null);
            await expect(service.delete(mockRequester as any, 'pool-1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update pool successfully', async () => {
            mockQuestionPoolRepository.findById.mockResolvedValue(mockPool);
            mockQuestionPoolRepository.update.mockResolvedValue({ ...mockPool, name: 'New Name' });

            const result = await service.update(mockRequester as any, 'pool-1', { name: 'New Name' });

            expect(result.name).toBe('New Name');
            expect(poolRepository.update).toHaveBeenCalled();
        });
    });
});
