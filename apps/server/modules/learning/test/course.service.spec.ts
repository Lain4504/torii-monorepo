import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from '@server/learning/modules/course/course.service';
import { COURSE_REPOSITORY_TOKEN, MODULE_REPOSITORY_TOKEN, LESSON_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { ENROLLMENT_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { getMapperToken } from '@automapper/nestjs';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@workspace/schemas';

describe('CourseService', () => {
    let service: CourseService;
    let courseRepository: any;
    let moduleRepository: any;
    let lessonRepository: any;
    let enrollmentService: any;
    let natsClient: any;
    let mapper: any;

    const mockCourseRepository = {
        create: jest.fn(),
        findById: jest.fn(),
        findMany: jest.fn(),
        findByType: jest.fn(),
        findBySlug: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        softDelete: jest.fn(),
        count: jest.fn(),
        slugExists: jest.fn(),
        getInstructors: jest.fn().mockResolvedValue([]), // Default to empty array to avoid undefined errors
        updateStats: jest.fn(),
    };

    const mockModuleRepository = {
        count: jest.fn(),
        findByCourseId: jest.fn(),
    };

    const mockLessonRepository = {
        count: jest.fn(),
        findByModuleId: jest.fn(),
    };

    const mockEnrollmentService = {
        isEnrolled: jest.fn(),
    };

    const mockNatsClient = {
        emit: jest.fn(),
    };

    const mockMapper = {
        map: jest.fn((source) => source),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CourseService,
                { provide: COURSE_REPOSITORY_TOKEN, useValue: mockCourseRepository },
                { provide: MODULE_REPOSITORY_TOKEN, useValue: mockModuleRepository },
                { provide: LESSON_REPOSITORY_TOKEN, useValue: mockLessonRepository },
                { provide: ENROLLMENT_SERVICE_TOKEN, useValue: mockEnrollmentService },
                { provide: 'NATS_SERVICE', useValue: mockNatsClient },
                { provide: getMapperToken(), useValue: mockMapper },
            ],
        }).compile();

        service = module.get<CourseService>(CourseService);
        courseRepository = module.get(COURSE_REPOSITORY_TOKEN);
        moduleRepository = module.get(MODULE_REPOSITORY_TOKEN);
        lessonRepository = module.get(LESSON_REPOSITORY_TOKEN);
        enrollmentService = module.get(ENROLLMENT_SERVICE_TOKEN);
        natsClient = module.get('NATS_SERVICE');
        mapper = module.get(getMapperToken());

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const dto = {
            title: 'Test Course',
            type: 'vod',
            price: 500000,
            isFree: false,
        };
        const requester = { sub: 'user-1', role: 'STAFF' as UserRole, permissions: [] };

        it('should create a paid course successfully', async () => {
            mockCourseRepository.slugExists.mockResolvedValue(false);
            mockCourseRepository.create.mockResolvedValue({ id: 'course-1', ...dto, status: 'draft' });

            const result = await service.create(requester as any, dto as any);

            expect(result).toBeDefined();
            expect(courseRepository.create).toHaveBeenCalled();
            expect(result.id).toEqual('course-1');
            expect(natsClient.emit).toHaveBeenCalledWith(
                { cmd: 'identity.audit.log' },
                expect.objectContaining({ action: 'course.create' })
            );
        });

        it('should throw BadRequestException if paid course has invalid price', async () => {
            const invalidDto = { ...dto, price: 0 };

            await expect(service.create(requester as any, invalidDto as any))
                .rejects.toThrow(BadRequestException);
        });

        it('should generate unique slug (handling duplicates)', async () => {
            mockCourseRepository.slugExists.mockResolvedValueOnce(true);
            mockCourseRepository.create.mockResolvedValue({ id: 'course-1', title: 'Test', slug: 'test-slug' });

            await service.create(requester as any, dto as any);

            expect(courseRepository.slugExists).toHaveBeenCalledTimes(1);
        });
    });

    describe('update', () => {
        const updateDto = { title: 'Updated Title' };

        it('should allow Admin/Staff with "course.update" and "course.publish" to update', async () => {
            const requester = { sub: 'admin-1', role: UserRole.ADMIN, permissions: ['course.update', 'course.publish'] };
            const existing = { id: 'course-1', title: 'Old Title' };

            mockCourseRepository.findById.mockResolvedValue(existing);
            mockCourseRepository.update.mockResolvedValue({ ...existing, ...updateDto });
            mockCourseRepository.slugExists.mockResolvedValue(false);

            const result = await service.update(requester as any, 'course-1', updateDto);

            expect(result.title).toEqual('Updated Title');
            expect(courseRepository.update).toHaveBeenCalled();
        });

        it('should allow Instructor assigned to course to update (even without explicit course.update permission?)', async () => {
            // Note: The code checks "course.update" FIRST (line 379).
            // if (!this.hasPermission(requester, 'course.update')) throw ForbiddenException
            // THEN it checks "course.publish" for bypassing ownership check.

            // This implies: EVERYONE needs 'course.update' permission in their JWT to even reach the ownership check.
            // If an instructor doesn't have 'course.update', they fail immediately at line 379.
            // Let's assume Instructor has 'course.update' but NOT 'course.publish'.

            const requester = { sub: 'inst-1', role: 'LECTURER' as UserRole, permissions: ['course.update'] };
            const existing = { id: 'course-1', title: 'Old Title' };

            mockCourseRepository.findById.mockResolvedValue(existing);
            // Mock getInstructors to return this user, matching isInstructor logic
            mockCourseRepository.getInstructors.mockResolvedValue([{ userId: 'inst-1' }]);
            mockCourseRepository.update.mockResolvedValue({ ...existing, ...updateDto });
            mockCourseRepository.slugExists.mockResolvedValue(false);

            const result = await service.update(requester as any, 'course-1', updateDto);
            expect(result.title).toEqual('Updated Title');
        });

        it('should forbid Instructor NOT assigned to course (even with course.update)', async () => {
            const requester = { sub: 'inst-2', role: 'LECTURER' as UserRole, permissions: ['course.update'] };
            const existing = { id: 'course-1', title: 'Old Title' };

            mockCourseRepository.findById.mockResolvedValue(existing);
            mockCourseRepository.getInstructors.mockResolvedValue([{ userId: 'inst-1' }]); // Different user

            await expect(service.update(requester as any, 'course-1', updateDto))
                .rejects.toThrow(ForbiddenException);
        });

        it('should forbid User WITHOUT "course.update" permission', async () => {
            const requester = { sub: 'user-1', role: UserRole.LEARNER, permissions: [] };
            // Fails at first check
            await expect(service.update(requester as any, 'course-1', updateDto))
                .rejects.toThrow(ForbiddenException);
        });
    });

    describe('getCurriculum', () => {
        const userId = 'student-1';
        const courseId = 'course-1';

        it('should show videoUrl if user is Enrolled', async () => {
            mockCourseRepository.findById.mockResolvedValue({ id: courseId });
            mockModuleRepository.findByCourseId.mockResolvedValue([{ id: 'mod-1', orderIndex: 1 }]);
            mockLessonRepository.findByModuleId.mockResolvedValue([
                { id: 'les-1', title: 'Lesson', contentType: 'video', videoUrl: 'secret.mp4', isPreview: false }
            ]);
            mockEnrollmentService.isEnrolled.mockResolvedValue(true);

            const result = await service.getCurriculum(courseId, userId);

            expect(result.modules[0].lessons[0].videoUrl).toBe('secret.mp4');
        });

        it('should HIDE videoUrl if user is NOT Enrolled and NOT Preview', async () => {
            mockCourseRepository.findById.mockResolvedValue({ id: courseId });
            mockModuleRepository.findByCourseId.mockResolvedValue([{ id: 'mod-1', orderIndex: 1 }]);
            mockLessonRepository.findByModuleId.mockResolvedValue([
                { id: 'les-1', title: 'Lesson', contentType: 'video', videoUrl: 'secret.mp4', isPreview: false }
            ]);
            mockEnrollmentService.isEnrolled.mockResolvedValue(false);

            const result = await service.getCurriculum(courseId, userId);

            expect(result.modules[0].lessons[0].videoUrl).toBeUndefined();
        });

        it('should ALWAYS show videoUrl if lesson isPreview', async () => {
            mockCourseRepository.findById.mockResolvedValue({ id: courseId });
            mockModuleRepository.findByCourseId.mockResolvedValue([{ id: 'mod-1' }]);
            mockLessonRepository.findByModuleId.mockResolvedValue([
                { id: 'les-1', videoUrl: 'preview.mp4', isPreview: true }
            ]);
            mockEnrollmentService.isEnrolled.mockResolvedValue(false);

            const result = await service.getCurriculum(courseId, userId);

            expect(result.modules[0].lessons[0].videoUrl).toBe('preview.mp4');
        });
    });

    describe('delete', () => {
        const requester = { sub: 'admin-1', role: 'ADMIN' as UserRole, permissions: ['course.delete'] };

        it('should soft delete if hardDelete is false', async () => {
            mockCourseRepository.findById.mockResolvedValue({ id: 'course-1', title: 'Del' });
            mockCourseRepository.softDelete.mockResolvedValue({ id: 'course-1' });

            await service.delete(requester as any, 'course-1', false);
            expect(courseRepository.softDelete).toHaveBeenCalledWith('course-1');
        });

        it('should hard delete if hardDelete is true', async () => {
            mockCourseRepository.findById.mockResolvedValue({ id: 'course-1', title: 'Del' });

            await service.delete(requester as any, 'course-1', true);
            expect(courseRepository.delete).toHaveBeenCalledWith('course-1');
        });
    });

    describe('isInstructor', () => {
        it('should return true if user is in instructor list', async () => {
            mockCourseRepository.getInstructors.mockResolvedValue([{ userId: 'inst-1' }, { userId: 'inst-2' }]);
            const result = await service.isInstructor('inst-1', 'course-1');
            expect(result).toBe(true);
        });

        it('should return false if user is NOT in instructor list', async () => {
            mockCourseRepository.getInstructors.mockResolvedValue([{ userId: 'inst-1' }]);
            const result = await service.isInstructor('inst-3', 'course-1');
            expect(result).toBe(false);
        });
    });
});
