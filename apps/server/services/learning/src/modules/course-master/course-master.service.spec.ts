import { Test, TestingModule } from '@nestjs/testing';
import { CourseMasterService } from './course-master.service';
import { COURSE_MASTER_REPOSITORY_TOKEN, MODULE_REPOSITORY_TOKEN, MODULE_ITEM_REPOSITORY_TOKEN, LESSON_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { ENROLLMENT_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { PrismaService } from '@server/shared';
import { CourseMasterStatus } from '@workspace/schemas';
import { BadRequestException } from '@nestjs/common';

import { getMapperToken } from '@automapper/nestjs';

describe('CourseMasterService', () => {
    let service: CourseMasterService;

    // Mock repositories
    let mockCourseMasterRepo: any;
    let mockModuleRepo: any;
    let mockModuleItemRepo: any;
    let mockLessonRepo: any;
    let mockPrismaService: any;
    let mockNatsClient: any;
    let mockMapper: any;
    let mockEnrollmentService: any;

    beforeEach(async () => {
        mockCourseMasterRepo = {
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateStatus: jest.fn(),
            getLatestVersion: jest.fn(),
            createVersion: jest.fn(),
            createMasterReview: jest.fn(),
            getLatestMasterReview: jest.fn(),
        };

        mockModuleRepo = {
            findByVersionId: jest.fn().mockResolvedValue([]),
            findByCourseId: jest.fn().mockResolvedValue([]),
            create: jest.fn(),
        };

        mockModuleItemRepo = {
            findByModuleId: jest.fn().mockResolvedValue([]),
            createMany: jest.fn(),
        };

        mockLessonRepo = {
            findByModuleId: jest.fn().mockResolvedValue([]),
        };

        mockPrismaService = {
            module: {
                findMany: jest.fn().mockResolvedValue([]),
            },
        };

        mockNatsClient = {
            emit: jest.fn(),
        };

        mockMapper = {
            mapAsync: jest.fn(),
        };

        mockEnrollmentService = {};

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CourseMasterService,
                { provide: COURSE_MASTER_REPOSITORY_TOKEN, useValue: mockCourseMasterRepo },
                { provide: MODULE_REPOSITORY_TOKEN, useValue: mockModuleRepo },
                { provide: MODULE_ITEM_REPOSITORY_TOKEN, useValue: mockModuleItemRepo },
                { provide: LESSON_REPOSITORY_TOKEN, useValue: mockLessonRepo },
                { provide: 'NATS_SERVICE', useValue: mockNatsClient },
                { provide: getMapperToken(), useValue: mockMapper },
                { provide: ENROLLMENT_SERVICE_TOKEN, useValue: mockEnrollmentService },
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<CourseMasterService>(CourseMasterService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Drafting & Review flow', () => {
        const adminRequester = { sub: 'admin-1', role: 'admin' as any, permissions: ['*'] };
        const lecturerRequester = { sub: 'lect-1', role: 'lecturer' as any, permissions: [] };

        it('should correctly initialize a CourseMaster as DRAFT upon creation', async () => {
            mockCourseMasterRepo.slugExists = jest.fn().mockResolvedValue(false);
            mockCourseMasterRepo.create.mockResolvedValue({ id: 'cm-1', title: 'Test VOD', type: 'vod', status: CourseMasterStatus.DRAFT });
            mockMapper.map = jest.fn().mockReturnValue({ id: 'cm-1', title: 'Test VOD', status: CourseMasterStatus.DRAFT });

            const result = await service.create(adminRequester, { title: 'Test VOD' } as any);

            expect(mockCourseMasterRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                status: CourseMasterStatus.DRAFT,
                createdBy: 'admin-1'
            }));
            expect(result.status).toEqual(CourseMasterStatus.DRAFT);
        });

        it('should forbid lecturers from creating CourseMasters', async () => {
            await expect(service.create(lecturerRequester, { title: 'Test VOD' } as any)).rejects.toThrow('Lecturers cannot create courses');
        });

        it('should transition DRAFT to PENDING_REVIEW on submitForSyllabusReview', async () => {
            const courseMaster = { id: 'cm-1', status: CourseMasterStatus.DRAFT };
            mockCourseMasterRepo.findById.mockResolvedValue(courseMaster);
            mockCourseMasterRepo.update.mockResolvedValue({ ...courseMaster, status: CourseMasterStatus.PENDING_REVIEW });
            mockCourseMasterRepo.createMasterReview = jest.fn().mockResolvedValue({});
            mockMapper.map = jest.fn().mockReturnValue({ id: 'cm-1', status: CourseMasterStatus.PENDING_REVIEW });

            const result = await service.submitForSyllabusReview(adminRequester, 'cm-1');

            expect(mockCourseMasterRepo.update).toHaveBeenCalledWith('cm-1', { status: CourseMasterStatus.PENDING_REVIEW });
            expect(mockCourseMasterRepo.createMasterReview).toHaveBeenCalled();
            expect(result.status).toEqual(CourseMasterStatus.PENDING_REVIEW);
        });

        it('should transition PENDING_REVIEW back to CHANGES_REQUIRED on rejection', async () => {
            const courseMaster = { id: 'cm-1', status: CourseMasterStatus.PENDING_REVIEW };
            mockCourseMasterRepo.findById.mockResolvedValue(courseMaster);
            mockCourseMasterRepo.update.mockResolvedValue({ ...courseMaster, status: CourseMasterStatus.CHANGES_REQUIRED });
            mockCourseMasterRepo.getLatestMasterReview = jest.fn().mockResolvedValue(null);
            mockMapper.map = jest.fn().mockReturnValue({ id: 'cm-1', status: CourseMasterStatus.CHANGES_REQUIRED });

            const result = await service.reject(adminRequester, 'cm-1', 'Needs more exams');

            expect(mockCourseMasterRepo.update).toHaveBeenCalledWith('cm-1', { status: CourseMasterStatus.CHANGES_REQUIRED });
            expect(result.status).toEqual(CourseMasterStatus.CHANGES_REQUIRED);
        });
    });

    describe('Clone-on-Edit versioning', () => {
        const adminRequester = { sub: 'admin-1', role: 'admin' as any, permissions: ['*'] };

        it('should trigger version publishing and VOD sync when APPROVED', async () => {
            const courseMaster = { id: 'cm-1', status: CourseMasterStatus.PENDING_REVIEW, type: 'vod' };
            const versionId = 'ver-1';

            mockCourseMasterRepo.findById.mockResolvedValue(courseMaster);
            mockCourseMasterRepo.update.mockResolvedValue({ ...courseMaster, status: CourseMasterStatus.APPROVED });
            mockCourseMasterRepo.getLatestMasterReview = jest.fn().mockResolvedValue(null);
            mockMapper.map = jest.fn().mockReturnValue({ id: 'cm-1', status: CourseMasterStatus.APPROVED });

            // Mock createCourseVersionSnapshot
            mockCourseMasterRepo.getLatestVersion.mockResolvedValue(null);
            mockModuleRepo.findByCourseId.mockResolvedValue([]);
            mockCourseMasterRepo.createVersion.mockResolvedValue({ id: versionId });

            // Mock publishVersion inner repo fetches
            mockCourseMasterRepo.getVersionById = jest.fn().mockResolvedValue({ id: versionId, courseMasterId: 'cm-1', versionTag: 'v1.0' });
            mockPrismaService.$transaction = jest.fn().mockResolvedValue([]);
            mockPrismaService.courseVersion = { updateMany: jest.fn(), update: jest.fn() };
            mockPrismaService.courseRun = { updateMany: jest.fn() };

            await service.reviewSyllabus(adminRequester, 'cm-1', { outcome: 'APPROVED' });

            // Expect CourseMasterStatus to be APPROVED
            expect(mockCourseMasterRepo.update).toHaveBeenCalledWith('cm-1', { status: CourseMasterStatus.APPROVED });

            // Expect versioning & VOD sync logic
            expect(mockCourseMasterRepo.createVersion).toHaveBeenCalled();
            expect(mockPrismaService.courseRun.updateMany).toHaveBeenCalledWith({
                where: { courseMasterId: 'cm-1' },
                data: { versionId: versionId }
            });
        });

        it('should create Clone-on-Edit deep copy Draft when triggering createDraftFromLatest', async () => {
            const publishedVersion = { id: 'pub-v1', status: 'PUBLISHED', versionTag: 'v1.0' };

            mockCourseMasterRepo.getLatestVersion.mockResolvedValue(publishedVersion);
            mockPrismaService.module.findMany.mockResolvedValue([
                { id: 'mod-1', title: 'Intro', items: [{ id: 'item-1' }] }
            ]);
            mockCourseMasterRepo.createVersion.mockResolvedValue({ id: 'draft-v2', status: 'DRAFT', versionTag: 'v2.0' });

            // Mock module + items creation during deep clone
            mockModuleRepo.findByVersionId.mockResolvedValue([{ id: 'mod-clone-source', title: 'Intro' }]);
            mockModuleRepo.create.mockResolvedValue({ id: 'mod-clone-dest' });
            mockModuleItemRepo.findByModuleId.mockResolvedValue([{ id: 'item-clone-source', title: 'L1' }]);

            const newDraft = await service.createDraftFromLatest(adminRequester, 'cm-1');

            expect(newDraft).toBeDefined();
            expect(newDraft.id).toEqual('draft-v2');
            expect(mockModuleRepo.create).toHaveBeenCalled();
            expect(mockModuleItemRepo.createMany).toHaveBeenCalled();
        });
    });
});
