import { Test, TestingModule } from '@nestjs/testing';
import { CourseRunService } from './course-run.service';
import { COURSE_MASTER_REPOSITORY_TOKEN, COURSE_RUN_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { PrismaService } from '@server/shared';
import { CourseRunStatus, UserRole } from '@workspace/schemas';
import { getMapperToken } from '@automapper/nestjs';

describe('CourseRunService', () => {
    let service: CourseRunService;
    let mockCourseRunRepo: any;
    let mockCourseMasterRepo: any;
    let mockPrismaService: any;
    let mockNatsClient: any;
    let mockMapper: any;

    beforeEach(async () => {
        mockCourseRunRepo = {
            create: jest.fn(),
            findById: jest.fn(),
            findBySlug: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            slugExists: jest.fn().mockResolvedValue(false),
            createRunReview: jest.fn(),
            findRunReviews: jest.fn().mockResolvedValue([]),
            updateRunReview: jest.fn(),
        };

        mockCourseMasterRepo = {
            findById: jest.fn(),
            getLatestVersion: jest.fn(),
        };

        mockPrismaService = {
            enrollment: {
                count: jest.fn(),
                findMany: jest.fn(),
            },
        };

        mockNatsClient = {
            emit: jest.fn(),
            send: jest.fn(),
        };

        mockMapper = {
            map: jest.fn(),
            mapArray: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CourseRunService,
                { provide: COURSE_RUN_REPOSITORY_TOKEN, useValue: mockCourseRunRepo },
                { provide: COURSE_MASTER_REPOSITORY_TOKEN, useValue: mockCourseMasterRepo },
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: 'NATS_SERVICE', useValue: mockNatsClient },
                { provide: getMapperToken(), useValue: mockMapper },
            ],
        }).compile();

        service = module.get<CourseRunService>(CourseRunService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Creation & Versioning Limits', () => {
        const adminRequester = { sub: 'admin-1', role: 'admin' as any, permissions: ['*'] };

        it('should prevent creating more than one CourseRun for a VOD course', async () => {
            mockCourseMasterRepo.findById.mockResolvedValue({ id: 'cm-1', type: 'vod' });
            mockCourseRunRepo.count.mockResolvedValue(1); // Already has 1 run

            await expect(
                service.create(adminRequester, { courseMasterId: 'cm-1', title: 'New VOD Run' } as any)
            ).rejects.toThrow('VOD courses can only have one CourseRun');
        });

        it('should require a published syllabus (latestVersion) to create a CourseRun', async () => {
            mockCourseMasterRepo.findById.mockResolvedValue({ id: 'cm-1', type: 'live' });
            mockCourseRunRepo.count.mockResolvedValue(0);
            mockCourseMasterRepo.getLatestVersion.mockResolvedValue(null); // No published syllabus

            await expect(
                service.create(adminRequester, { courseMasterId: 'cm-1', title: 'Live Run' } as any)
            ).rejects.toThrow('Cannot create a run for an empty or unpublished course master');
        });

        it('should successfully create a LIVE CourseRun and pin it to latest version', async () => {
            mockCourseMasterRepo.findById.mockResolvedValue({ id: 'cm-1', type: 'live', slug: 'test-course' });
            mockCourseMasterRepo.getLatestVersion.mockResolvedValue({ id: 'ver-1' });
            mockCourseRunRepo.create.mockResolvedValue({ id: 'run-1', title: 'Live Run' });

            const result = await service.create(adminRequester, { courseMasterId: 'cm-1', title: 'Live Run' } as any);

            expect(mockCourseRunRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                versionId: 'ver-1',
                status: CourseRunStatus.DRAFT,
            }));
        });
    });

    describe('State Transition Guards', () => {
        const adminRequester = { sub: 'admin-1', role: 'admin' as any, permissions: ['*'] };

        it('should prevent moving a LIVE course to ENROLLING if startDate is missing', async () => {
            const liveRun = { id: 'run-1', courseMasterId: 'cm-1', status: CourseRunStatus.APPROVED, startDate: null };
            mockCourseRunRepo.findById.mockResolvedValue(liveRun);
            mockCourseMasterRepo.findById.mockResolvedValue({ id: 'cm-1', type: 'live' });

            await expect(
                service.updateStatus(adminRequester, 'run-1', CourseRunStatus.ENROLLING)
            ).rejects.toThrow('Cannot open enrollment without a start date set');
        });

        it('should prevent moving to IN_PROGRESS if minimum enrollment is not met', async () => {
            const run = {
                id: 'run-1',
                courseMasterId: 'cm-1',
                status: CourseRunStatus.ENROLLING,
                minStudents: 10,
                totalStudents: 5
            };
            mockCourseRunRepo.findById.mockResolvedValue(run);
            mockCourseMasterRepo.findById.mockResolvedValue({ id: 'cm-1', type: 'live' });

            await expect(
                service.updateStatus(adminRequester, 'run-1', CourseRunStatus.IN_PROGRESS)
            ).rejects.toThrow('Cannot start class: enrolled students (5) is less than minimum required (10)');
        });

        it('should allow moving to IN_PROGRESS if minimum enrollment is met', async () => {
            const run = {
                id: 'run-1',
                courseMasterId: 'cm-1',
                status: CourseRunStatus.ENROLLING,
                minStudents: 10,
                totalStudents: 15
            };
            mockCourseRunRepo.findById.mockResolvedValue(run);
            mockCourseMasterRepo.findById.mockResolvedValue({ id: 'cm-1', type: 'live' });
            mockCourseRunRepo.update.mockResolvedValue({ ...run, status: CourseRunStatus.IN_PROGRESS });

            await service.updateStatus(adminRequester, 'run-1', CourseRunStatus.IN_PROGRESS);

            expect(mockCourseRunRepo.update).toHaveBeenCalledWith('run-1', { status: CourseRunStatus.IN_PROGRESS });
        });
    });
});
