import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentService } from '@server/learning/modules/assignment/assignment.service';
import { AssignmentRepository } from '@server/learning/modules/assignment/assignment.repository';
import { SubmissionRepository } from '@server/learning/modules/submission/submission.repository';
import { getMapperToken } from '@automapper/nestjs';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRole } from '@workspace/schemas';

describe('AssignmentService', () => {
    let service: AssignmentService;
    let assignmentRepository: any;
    let submissionRepository: any;
    let natsClient: any;
    let mapper: any;

    const mockAssignment = {
        id: 'assignment-1',
        title: 'Test Assignment',
        description: 'Test Description',
        createdBy: 'instructor-1',
        status: 'DRAFT',
        courseId: 'course-1',
        moduleId: 'module-1',
        lessonId: 'lesson-1',
    };

    const mockRequester = {
        sub: 'instructor-1',
        role: UserRole.LECTURER,
        permissions: ['assignment.create', 'assignment.update', 'assignment.delete'],
    };

    const mockAssignmentRepository = {
        create: jest.fn(),
        update: jest.fn(),
        findById: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        delete: jest.fn(),
    };

    const mockSubmissionRepository = {
        findMany: jest.fn(),
        count: jest.fn(),
    };

    const mockNatsClient = {
        emit: jest.fn(),
    };

    const mockMapper = {
        map: jest.fn().mockImplementation((val) => (val ? { ...val } : val)),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AssignmentService,
                {
                    provide: AssignmentRepository,
                    useValue: mockAssignmentRepository,
                },
                {
                    provide: SubmissionRepository,
                    useValue: mockSubmissionRepository,
                },
                {
                    provide: 'NATS_SERVICE',
                    useValue: mockNatsClient,
                },
                {
                    provide: getMapperToken(),
                    useValue: mockMapper,
                },
            ],
        }).compile();

        service = module.get<AssignmentService>(AssignmentService);
        assignmentRepository = module.get(AssignmentRepository);
        submissionRepository = module.get(SubmissionRepository);
        natsClient = module.get('NATS_SERVICE');
        mapper = module.get(getMapperToken());

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const dto = {
            title: 'New Assignment',
            description: 'New Description',
            courseId: 'course-1',
            moduleId: 'module-1',
            lessonId: 'lesson-1',
        };

        it('should create an assignment successfully', async () => {
            mockAssignmentRepository.create.mockResolvedValue(mockAssignment);

            const result = await service.create(mockRequester as any, dto as any);

            expect(result).toBeDefined();
            expect(assignmentRepository.create).toHaveBeenCalled();
            expect(result.id).toBe(mockAssignment.id);
        });

        it('should throw ForbiddenException if user has no permission', async () => {
            const lowPrivRequester = { ...mockRequester, permissions: [] };
            await expect(service.create(lowPrivRequester as any, dto as any))
                .rejects.toThrow(ForbiddenException);
        });

        it('should throw BadRequestException on repository error', async () => {
            mockAssignmentRepository.create.mockRejectedValue(new Error('DB Error'));
            await expect(service.create(mockRequester as any, dto as any))
                .rejects.toThrow(BadRequestException);
        });
    });

    describe('update', () => {
        const updateDto = { title: 'Updated Title' };

        it('should update assignment successfully', async () => {
            mockAssignmentRepository.findById.mockResolvedValue(mockAssignment);
            mockAssignmentRepository.update.mockResolvedValue({ ...mockAssignment, ...updateDto });

            const result = await service.update(mockRequester as any, 'assignment-1', updateDto as any);

            expect(result.title).toBe(updateDto.title);
            expect(assignmentRepository.update).toHaveBeenCalled();
        });

        it('should throw NotFoundException if assignment not found', async () => {
            mockAssignmentRepository.findById.mockResolvedValue(null);
            await expect(service.update(mockRequester as any, 'non-existent', updateDto as any))
                .rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if user is not the creator', async () => {
            mockAssignmentRepository.findById.mockResolvedValue({ ...mockAssignment, createdBy: 'other-instructor' });
            await expect(service.update(mockRequester as any, 'assignment-1', updateDto as any))
                .rejects.toThrow(ForbiddenException);
        });
    });

    describe('publish', () => {
        it('should publish assignment and emit event', async () => {
            mockAssignmentRepository.findById.mockResolvedValue(mockAssignment);
            mockAssignmentRepository.update.mockResolvedValue({ ...mockAssignment, status: 'PUBLISHED' });

            const result = await service.publish(mockRequester as any, 'assignment-1');

            expect(result.status).toBe('PUBLISHED');
            expect(natsClient.emit).toHaveBeenCalledWith('assignment.published', expect.any(Object));
        });

        it('should throw BadRequestException if already published', async () => {
            mockAssignmentRepository.findById.mockResolvedValue({ ...mockAssignment, status: 'PUBLISHED' });
            await expect(service.publish(mockRequester as any, 'assignment-1'))
                .rejects.toThrow(BadRequestException);
        });
    });

    describe('findAll', () => {
        it('should return paginated assignments with user submission status', async () => {
            const query = { page: 1, limit: 10 };
            mockAssignmentRepository.count.mockResolvedValue(1);
            mockAssignmentRepository.findMany.mockResolvedValue([mockAssignment]);
            mockSubmissionRepository.findMany.mockResolvedValue([{ assignmentId: 'assignment-1', status: 'SUBMITTED' }]);

            const result = await service.findAll(mockRequester as any, query as any);

            expect(result.data).toHaveLength(1);
            expect(result.data[0].userSubmissionStatus).toBe('SUBMITTED');
            expect(result.total).toBe(1);
        });
    });

    describe('findById', () => {
        it('should return assignment successfully', async () => {
            mockAssignmentRepository.findById.mockResolvedValue(mockAssignment);
            const result = await service.findById('assignment-1');
            expect(result.id).toBe(mockAssignment.id);
        });

        it('should throw NotFoundException if not found', async () => {
            mockAssignmentRepository.findById.mockResolvedValue(null);
            await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete assignment if no submissions exist', async () => {
            mockAssignmentRepository.findById.mockResolvedValue(mockAssignment);
            mockSubmissionRepository.count.mockResolvedValue(0);
            mockAssignmentRepository.delete.mockResolvedValue({ id: 'assignment-1' });

            const result = await service.delete(mockRequester as any, 'assignment-1');

            expect(result.message).toContain('deleted successfully');
            expect(assignmentRepository.delete).toHaveBeenCalledWith('assignment-1');
        });

        it('should throw BadRequestException if submissions exist', async () => {
            mockAssignmentRepository.findById.mockResolvedValue(mockAssignment);
            mockSubmissionRepository.count.mockResolvedValue(1);

            await expect(service.delete(mockRequester as any, 'assignment-1'))
                .rejects.toThrow(BadRequestException);
        });
    });
});
