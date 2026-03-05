import { Test, TestingModule } from '@nestjs/testing';
import { CourseRunService } from './course-run.service';
import {
  COURSE_MASTER_REPOSITORY_TOKEN,
  COURSE_RUN_REPOSITORY_TOKEN,
} from '../../interfaces/repositories';
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
      map: jest.fn().mockReturnValue({}),
      mapArray: jest.fn().mockReturnValue([]),
      mapAsync: jest.fn().mockResolvedValue({}),
      mapArrayAsync: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseRunService,
        { provide: COURSE_RUN_REPOSITORY_TOKEN, useValue: mockCourseRunRepo },
        {
          provide: COURSE_MASTER_REPOSITORY_TOKEN,
          useValue: mockCourseMasterRepo,
        },
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
    const adminRequester = {
      sub: 'admin-1',
      role: 'admin' as any,
      permissions: ['*'],
    };

    it('should prevent creating more than one CourseRun for a VOD course', async () => {
      mockCourseMasterRepo.findById.mockResolvedValue({
        id: 'cm-1',
        type: 'vod',
      });
      mockCourseRunRepo.count.mockResolvedValue(1); // Already has 1 run

      await expect(
        service.create(adminRequester, {
          courseMasterId: 'cm-1',
          title: 'New VOD Run',
        } as any),
      ).rejects.toThrow('VOD courses can only have one CourseRun');
    });

    it('should require a published syllabus (latestVersion) to create a CourseRun', async () => {
      mockCourseMasterRepo.findById.mockResolvedValue({
        id: 'cm-1',
        type: 'live',
      });
      mockCourseRunRepo.count.mockResolvedValue(0);
      mockCourseMasterRepo.getLatestVersion.mockResolvedValue(null); // No published syllabus

      await expect(
        service.create(adminRequester, {
          courseMasterId: 'cm-1',
          title: 'Live Run',
        } as any),
      ).rejects.toThrow(
        'Cannot create a run for an empty or unpublished course master',
      );
    });

    it('should successfully create a LIVE CourseRun and pin it to latest version', async () => {
      mockCourseMasterRepo.findById.mockResolvedValue({
        id: 'cm-1',
        type: 'live',
        slug: 'test-course',
      });
      mockCourseMasterRepo.getLatestVersion.mockResolvedValue({ id: 'ver-1' });
      mockCourseRunRepo.create.mockResolvedValue({
        id: 'run-1',
        title: 'Live Run',
      });

      const result = await service.create(adminRequester, {
        courseMasterId: 'cm-1',
        title: 'Live Run',
      } as any);

      expect(mockCourseRunRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          versionId: 'ver-1',
          status: CourseRunStatus.DRAFT,
        }),
      );
    });
  });

  describe('State Transition Guards', () => {
    const adminRequester = {
      sub: 'admin-1',
      role: 'admin' as any,
      permissions: ['*'],
    };

    it('should prevent moving a LIVE course to ENROLLING if startDate is missing', async () => {
      const liveRun = {
        id: 'run-1',
        courseMasterId: 'cm-1',
        status: CourseRunStatus.APPROVED,
        startDate: null,
      };
      mockCourseRunRepo.findById.mockResolvedValue(liveRun);
      mockCourseMasterRepo.findById.mockResolvedValue({
        id: 'cm-1',
        type: 'live',
      });

      await expect(
        service.updateStatus(
          adminRequester,
          'run-1',
          CourseRunStatus.ENROLLING,
        ),
      ).rejects.toThrow('Cannot open enrollment without a start date set');
    });

    it('should prevent moving to IN_PROGRESS if minimum enrollment is not met', async () => {
      const run = {
        id: 'run-1',
        courseMasterId: 'cm-1',
        status: CourseRunStatus.ENROLLING,
        minStudents: 10,
        totalStudents: 5,
      };
      mockCourseRunRepo.findById.mockResolvedValue(run);
      mockCourseMasterRepo.findById.mockResolvedValue({
        id: 'cm-1',
        type: 'live',
      });

      await expect(
        service.updateStatus(
          adminRequester,
          'run-1',
          CourseRunStatus.IN_PROGRESS,
        ),
      ).rejects.toThrow(
        'Cannot start class: enrolled students (5) is less than minimum required (10)',
      );
    });

    it('should allow moving to IN_PROGRESS if minimum enrollment is met', async () => {
      const run = {
        id: 'run-1',
        courseMasterId: 'cm-1',
        status: CourseRunStatus.ENROLLING,
        minStudents: 10,
        totalStudents: 15,
      };
      mockCourseRunRepo.findById.mockResolvedValue(run);
      mockCourseMasterRepo.findById.mockResolvedValue({
        id: 'cm-1',
        type: 'live',
      });
      mockCourseRunRepo.update.mockResolvedValue({
        ...run,
        status: CourseRunStatus.IN_PROGRESS,
      });
      mockMapper.mapAsync = jest
        .fn()
        .mockResolvedValue({ ...run, status: CourseRunStatus.IN_PROGRESS });

      const result = await service.updateStatus(
        adminRequester,
        'run-1',
        CourseRunStatus.IN_PROGRESS,
      );

      expect(mockCourseRunRepo.update).toHaveBeenCalledWith('run-1', {
        status: CourseRunStatus.IN_PROGRESS,
      });
    });
  });

  describe('Core Mechanics', () => {
    const adminRequester = {
      sub: 'admin-1',
      role: 'admin' as any,
      permissions: [
        'course.run.update',
        'course.run.delete',
        'course.run.publish',
      ],
    };
    const studentRequester = {
      sub: 'student-1',
      role: 'student' as any,
      permissions: [],
    };

    it('should findAll course runs with default DTO mapping', async () => {
      mockCourseRunRepo.count.mockResolvedValue(1);
      mockCourseRunRepo.findMany.mockResolvedValue([
        { id: 'run-1', title: 'Test Run' },
      ]);
      mockMapper.mapAsync = jest.fn().mockResolvedValue({ id: 'run-1' });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(mockCourseRunRepo.count).toHaveBeenCalled();
      expect(mockCourseRunRepo.findMany).toHaveBeenCalled();
      expect(result.data).toBeDefined();
      expect(result.data!.length).toEqual(1);
    });

    it('should findMyRuns for instructor with correct filter', async () => {
      mockCourseRunRepo.count.mockResolvedValue(1);
      mockCourseRunRepo.findMany.mockResolvedValue([
        { id: 'run-1', createdBy: 'admin-1' },
      ]);
      mockMapper.mapAsync = jest.fn().mockResolvedValue({ id: 'run-1' });

      const result = await service.findMyRuns(adminRequester, {
        page: 1,
        limit: 10,
      });

      expect(mockCourseRunRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ lecturerId: 'admin-1' }),
        }),
      );
      expect(result.total).toEqual(1);
    });

    it('should findById and findBySlug', async () => {
      mockCourseRunRepo.findById.mockResolvedValue({ id: 'run-1' });
      mockCourseRunRepo.findBySlug.mockResolvedValue({ id: 'run-1' });
      mockMapper.mapAsync = jest.fn().mockResolvedValue({ id: 'run-1' });

      const result1 = await service.findById('run-1');
      const result2 = await service.findBySlug('slug-1');

      expect(mockCourseRunRepo.findById).toHaveBeenCalledWith('run-1');
      expect(mockCourseRunRepo.findBySlug).toHaveBeenCalledWith('slug-1');
      expect(result1.id).toEqual('run-1');
      expect(result2.id).toEqual('run-1');
    });

    it('should update course run properties and generate new slug if title changes', async () => {
      mockCourseRunRepo.findById.mockResolvedValue({
        id: 'run-1',
        title: 'Old Title',
        createdBy: 'admin-1',
      });
      mockCourseRunRepo.slugExists.mockResolvedValue(false);
      mockCourseRunRepo.update.mockResolvedValue({
        id: 'run-1',
        title: 'New Title',
        slug: 'new-title-hash',
      });
      mockMapper.mapAsync = jest
        .fn()
        .mockResolvedValue({ id: 'run-1', title: 'New Title' });

      const result = await service.update(adminRequester, 'run-1', {
        title: 'New Title',
      } as any);

      expect(mockCourseRunRepo.update).toHaveBeenCalledWith(
        'run-1',
        expect.objectContaining({
          title: 'New Title',
          slug: expect.any(String),
        }),
      );
      expect(result.title).toEqual('New Title');
    });

    it('should throw Forbidden on update if user is not owner and not system-wide admin', async () => {
      mockCourseRunRepo.findById.mockResolvedValue({
        id: 'run-1',
        createdBy: 'someone-else',
      });
      // Mock permissions to drop `course.run.update_all` implicitly. Assuming admin-1 doesn't have it based on setup.

      // Provide strict non-admin instructor token
      const strictInstructor = {
        sub: 'inst-1',
        role: 'lecturer' as any,
        permissions: ['course.run.update'],
      };
      await expect(
        service.update(strictInstructor, 'run-1', { title: 'Hacked' } as any),
      ).rejects.toThrow(
        'You are not the assigned lecturer for this course run.',
      );
    });

    it('should perform submitForContentReview cleanly', async () => {
      const run = {
        id: 'run-1',
        status: CourseRunStatus.DRAFT,
        createdBy: 'admin-1',
      };
      mockCourseRunRepo.findById.mockResolvedValue(run);
      mockCourseRunRepo.update.mockResolvedValue({
        ...run,
        status: CourseRunStatus.PENDING_REVIEW,
      });
      mockMapper.mapAsync = jest.fn().mockResolvedValue({
        id: 'run-1',
        status: CourseRunStatus.PENDING_REVIEW,
      });

      const result = await service.submitForContentReview(
        adminRequester,
        'run-1',
      );

      expect(mockCourseRunRepo.createRunReview).toHaveBeenCalled();
      expect(mockCourseRunRepo.update).toHaveBeenCalledWith('run-1', {
        status: CourseRunStatus.PENDING_REVIEW,
      });
      expect(result.status).toEqual(CourseRunStatus.PENDING_REVIEW);
    });

    it('should perform reviewRunContent to APPROVED state if accepted', async () => {
      const run = { id: 'run-1', status: CourseRunStatus.PENDING_REVIEW };
      const reviewId = 'rev-1';
      mockCourseRunRepo.findById.mockResolvedValue(run);
      mockCourseRunRepo.findRunReviews.mockResolvedValue([{ id: reviewId }]);
      mockCourseRunRepo.update.mockResolvedValue({
        ...run,
        status: CourseRunStatus.APPROVED,
      });
      mockCourseRunRepo.updateRunReview = jest.fn();
      mockMapper.mapAsync = jest
        .fn()
        .mockResolvedValue({ id: 'run-1', status: CourseRunStatus.APPROVED });

      const result = await service.reviewRunContent(adminRequester, 'run-1', {
        outcome: 'APPROVED',
        notes: 'Looks good',
      } as any);

      expect(mockCourseRunRepo.updateRunReview).toHaveBeenCalledWith(
        reviewId,
        expect.objectContaining({ status: 'APPROVED' }),
      );
      expect(mockCourseRunRepo.update).toHaveBeenCalledWith('run-1', {
        status: CourseRunStatus.APPROVED,
      });
      expect(result.status).toEqual(CourseRunStatus.APPROVED);
    });

    it('should restrict delete if students are actively enrolled', async () => {
      mockCourseRunRepo.findById.mockResolvedValue({
        id: 'run-1',
        totalStudents: 10,
        createdBy: 'admin-1',
      });

      await expect(service.delete(adminRequester, 'run-1')).rejects.toThrow(
        'Cannot delete a course run with enrolled students',
      );
    });

    it('should soft delete successfully if no students are enrolled', async () => {
      mockCourseRunRepo.findById.mockResolvedValue({
        id: 'run-1',
        totalStudents: 0,
        createdBy: 'admin-1',
      });

      await service.delete(adminRequester, 'run-1');

      expect(mockCourseRunRepo.delete).toHaveBeenCalledWith('run-1');
    });
  });
});
