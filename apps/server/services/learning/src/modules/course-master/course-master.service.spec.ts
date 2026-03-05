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
            count: jest.fn(),
            slugExists: jest.fn(),
            findMany: jest.fn(),
            softDelete: jest.fn(),
            delete: jest.fn(),
            getLecturer: jest.fn(),
            getVersions: jest.fn(),
            getVersionById: jest.fn(),
            countLessons: jest.fn(),
            isInstructor: jest.fn(),
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
            map: jest.fn().mockReturnValue({}),
            mapArray: jest.fn().mockReturnValue([]),
            mapAsync: jest.fn().mockResolvedValue({}),
            mapArrayAsync: jest.fn().mockResolvedValue([]),
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
            mockMapper.map = jest.fn().mockResolvedValue({ id: 'cm-1', title: 'Test VOD', status: CourseMasterStatus.DRAFT });

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
            mockMapper.map = jest.fn().mockResolvedValue({ id: 'cm-1', status: CourseMasterStatus.PENDING_REVIEW });

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
            mockMapper.map = jest.fn().mockResolvedValue({ id: 'cm-1', status: CourseMasterStatus.CHANGES_REQUIRED });

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

    describe('Core Mechanics', () => {
        const adminRequester = { sub: 'admin-1', role: 'admin' as any, permissions: ['course.update', 'course.publish', 'course.delete', 'course.view_restricted'] };
        const studentRequester = { sub: 'student-1', role: 'student' as any, permissions: [] };

        it('should findAll courses with pagination and filters', async () => {
            mockCourseMasterRepo.count.mockResolvedValue(1);
            mockCourseMasterRepo.findMany.mockResolvedValue([{ id: 'cm-1' }]);
            mockMapper.map = jest.fn().mockReturnValue({ id: 'cm-1' });

            const result = await service.findAll({ page: 1, limit: 10, search: 'test', status: CourseMasterStatus.APPROVED });

            expect(mockCourseMasterRepo.count).toHaveBeenCalled();
            expect(mockCourseMasterRepo.findMany).toHaveBeenCalledWith(expect.objectContaining({
                skip: 0,
                take: 10,
                where: expect.objectContaining({ status: CourseMasterStatus.APPROVED, OR: expect.any(Array) })
            }));
            expect(result.data.length).toEqual(1);
            expect(result.total).toEqual(1);
        });

        it('should perform advancedSearch for client users forcing APPROVED status', async () => {
            mockCourseMasterRepo.count.mockResolvedValue(1);
            mockCourseMasterRepo.findMany.mockResolvedValue([{ id: 'cm-1' }]);
            mockMapper.map = jest.fn().mockReturnValue({ id: 'cm-1' });

            const result = await service.advancedSearch({ page: 1, limit: 10, levels: ['N1'] });

            expect(mockCourseMasterRepo.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ status: CourseMasterStatus.APPROVED, jlptLevel: { in: ['N1'] } })
            }));
            expect(result.data.length).toEqual(1);
        });

        it('should findById and attach lecturer', async () => {
            mockCourseMasterRepo.findById.mockResolvedValue({ id: 'cm-1' });
            mockCourseMasterRepo.getLecturer = jest.fn().mockResolvedValue({ id: 'lecturer-1' });
            mockMapper.map = jest.fn().mockReturnValue({ id: 'cm-1' });

            const result = await service.findById('cm-1');

            expect(mockCourseMasterRepo.findById).toHaveBeenCalledWith('cm-1');
            expect(mockCourseMasterRepo.getLecturer).toHaveBeenCalledWith('cm-1');
            expect(result.lecturer).toEqual({ id: 'lecturer-1' });
        });

        it('should throw NotFoundException on findById if missing or deleted', async () => {
            mockCourseMasterRepo.findById.mockResolvedValue(null);
            await expect(service.findById('cm-1')).rejects.toThrow('not found');
        });

        it('should update course attributes and generate new slug if title changes', async () => {
            mockCourseMasterRepo.findById.mockResolvedValue({ id: 'cm-1', title: 'Old Title' });
            mockCourseMasterRepo.slugExists.mockResolvedValue(false);
            mockCourseMasterRepo.update.mockResolvedValue({ id: 'cm-1', title: 'New Title' });
            mockMapper.map = jest.fn().mockReturnValue({ id: 'cm-1', title: 'New Title' });

            const result = await service.update(adminRequester, 'cm-1', { title: 'New Title' });

            expect(mockCourseMasterRepo.slugExists).toHaveBeenCalled();
            expect(mockCourseMasterRepo.update).toHaveBeenCalledWith('cm-1', expect.objectContaining({ title: 'New Title', slug: expect.any(String) }));
            expect(result.title).toEqual('New Title');
        });


        it('should soft delete and hard delete correctly based on flag', async () => {
            mockCourseMasterRepo.findById.mockResolvedValue({ id: 'cm-1' });
            mockCourseMasterRepo.softDelete = jest.fn();
            mockCourseMasterRepo.delete = jest.fn();

            await service.delete(adminRequester, 'cm-1', false);
            expect(mockCourseMasterRepo.softDelete).toHaveBeenCalledWith('cm-1');

            await service.delete(adminRequester, 'cm-1', true);
            expect(mockCourseMasterRepo.delete).toHaveBeenCalledWith('cm-1');
        });

        it('should validateForScheduling for live courses', async () => {
            mockCourseMasterRepo.findById.mockResolvedValue({ id: 'cm-1', status: CourseMasterStatus.APPROVED, type: 'live' });
            mockCourseMasterRepo.countLessons = jest.fn().mockResolvedValue(5);

            const result = await service.validateForScheduling('cm-1');
            expect(result.isReady).toEqual(true);
        });

        it('should fail validateForScheduling if not APPROVED', async () => {
            mockCourseMasterRepo.findById.mockResolvedValue({ id: 'cm-1', status: CourseMasterStatus.DRAFT, type: 'live' });
            const result = await service.validateForScheduling('cm-1');
            expect(result.isReady).toEqual(false);
            expect(result.message).toContain('must be approved');
        });

        it('should fail validateForScheduling if not live type', async () => {
            mockCourseMasterRepo.findById.mockResolvedValue({ id: 'cm-1', status: CourseMasterStatus.APPROVED, type: 'vod' });
            const result = await service.validateForScheduling('cm-1');
            expect(result.isReady).toEqual(false);
            expect(result.message).toContain('Only live course masters');
        });

        it('should getCurriculum from snapshot if student is enrolled', async () => {
            mockCourseMasterRepo.findById.mockResolvedValue({ id: 'cm-1' });
            mockEnrollmentService.isEnrolled = jest.fn().mockResolvedValue(true);
            mockEnrollmentService.findByUserAndCourseMaster = jest.fn().mockResolvedValue({ versionId: 'ver-1' });
            mockCourseMasterRepo.getVersionById = jest.fn().mockResolvedValue({
                curriculumSnapshot: [
                    { id: 'mod-1', title: 'M1', orderIndex: 1, lessons: [{ id: 'ls-1', title: 'L1', orderIndex: 1, status: 'published', isPreview: false }] }
                ]
            });

            const result = await service.getCurriculum('cm-1', studentRequester);

            expect(mockCourseMasterRepo.getVersionById).toHaveBeenCalledWith('ver-1');
            expect(result.modules.length).toEqual(1);
            expect(result.modules[0].lessons[0].isUnlocked).toEqual(true); // Student has access
        });

        it('should getCurriculum from draft tables if instructor/admin', async () => {
            mockCourseMasterRepo.findById.mockResolvedValue({ id: 'cm-1' });
            mockCourseMasterRepo.isInstructor = jest.fn().mockResolvedValue(true); // Is instructor

            mockModuleRepo.findByCourseId.mockResolvedValue([{ id: 'mod-1', title: 'M1', orderIndex: 1 }]);
            mockLessonRepo.findByModuleId.mockResolvedValue([{ id: 'ls-1', title: 'L1', orderIndex: 1, status: 'draft', isPreview: false }]);

            const result = await service.getCurriculum('cm-1', adminRequester);

            expect(mockModuleRepo.findByCourseId).toHaveBeenCalledWith('cm-1');
            expect(result.modules.length).toEqual(1);
            expect(result.modules[0].lessons[0].isUnlocked).toEqual(true); // Instructor has access to draft
        });

        it('should return getVersionHistory successfully', async () => {
            mockCourseMasterRepo.getVersions = jest.fn().mockResolvedValue([
                { id: 'v1', versionTag: '1.0', createdAt: new Date() }
            ]);

            const result = await service.getVersionHistory('cm-1');
            expect(result.length).toEqual(1);
            expect(result[0].versionTag).toEqual('1.0');
        });
    });
});
