import { Test, TestingModule } from '@nestjs/testing';
import { LearningProgressService } from './learning-progress.service';
import {
  LEARNING_PROGRESS_REPOSITORY_TOKEN,
  ENROLLMENT_REPOSITORY_TOKEN,
  COURSE_MASTER_REPOSITORY_TOKEN,
  LESSON_REPOSITORY_TOKEN,
  MODULE_REPOSITORY_TOKEN,
} from '@server/learning/interfaces/repositories';
import { CERTIFICATE_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { PrismaService } from '@server/shared';
import { EnrollmentStatus } from '@workspace/schemas';

describe('LearningProgress & Full E-Learning Flow Simulation', () => {
  let service: LearningProgressService;
  let mockProgressRepo: any;
  let mockEnrollmentRepo: any;
  let mockCourseRepo: any;
  let mockLessonRepo: any;
  let mockModuleRepo: any;
  let mockCertificateService: any;
  let mockNatsClient: any;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockProgressRepo = {
      countCompletedLessons: jest.fn(),
      upsert: jest.fn(),
      getTotalLearningSeconds: jest.fn(),
      getCompletedLessonIds: jest.fn(),
      findRecentProgress: jest.fn(),
    };

    mockEnrollmentRepo = {
      findMany: jest.fn(),
      findByUserAndCourseMaster: jest.fn(),
      update: jest.fn(),
    };

    mockCourseRepo = {
      getVersionById: jest.fn(),
    };

    mockLessonRepo = {
      count: jest.fn(),
      findById: jest.fn(),
    };

    mockModuleRepo = {
      findById: jest.fn(),
    };

    mockCertificateService = {
      issueCertificate: jest.fn().mockResolvedValue(true),
    };

    mockNatsClient = {
      emit: jest.fn(),
    };

    mockPrismaService = {
      quiz: { findMany: jest.fn() },
      quizAttempt: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningProgressService,
        {
          provide: LEARNING_PROGRESS_REPOSITORY_TOKEN,
          useValue: mockProgressRepo,
        },
        { provide: ENROLLMENT_REPOSITORY_TOKEN, useValue: mockEnrollmentRepo },
        { provide: COURSE_MASTER_REPOSITORY_TOKEN, useValue: mockCourseRepo },
        { provide: LESSON_REPOSITORY_TOKEN, useValue: mockLessonRepo },
        { provide: MODULE_REPOSITORY_TOKEN, useValue: mockModuleRepo },
        {
          provide: CERTIFICATE_SERVICE_TOKEN,
          useValue: mockCertificateService,
        },
        { provide: 'NATS_SERVICE', useValue: mockNatsClient },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<LearningProgressService>(LearningProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Full Flow Simulation & Tracking Logic', () => {
    const studentId = 'student-123';
    const courseMasterId = 'cm-1';
    const enrollmentId = 'enr-1';
    const versionId = 'ver-v1'; // The snapshot they enrolled in
    const lessonId = 'les-1';

    it('Phase 1: Student sees their enrolled snapshot regardless of live edits', async () => {
      /**
       * SCENARIO:
       * Admin created Course Master and Course Run. Version v1 had 5 lessons.
       * User enrolled. The enrollment saves `versionId: ver-v1`.
       * Admin edits course -> creates Draft, adds 2 new lessons, gets Approved.
       * Live totalLessons becomes 7.
       * But the student SHOULD still see their progress against 5 lessons since they are locked to ver-v1.
       */
      mockEnrollmentRepo.findMany.mockResolvedValue([
        {
          id: enrollmentId,
          userId: studentId,
          courseRunId: 'run-1',
          versionId: versionId, // User's snapshot
          completionPercentage: 40,
          courseRun: {
            id: 'run-1',
            courseMaster: {
              id: courseMasterId,
              title: 'Original Title', // Title from their run
              type: 'vod',
            },
          },
        },
      ]);

      mockCourseRepo.getVersionById.mockResolvedValue({
        id: versionId,
        curriculumSnapshot: [
          {
            id: 'mod-1',
            lessons: [
              { id: 'l1' },
              { id: 'l2' },
              { id: 'l3' },
              { id: 'l4' },
              { id: 'l5' },
            ], // 5 lessons
          },
        ],
      });

      mockProgressRepo.countCompletedLessons.mockResolvedValue(2); // Finished 2 out of 5

      const result = await service.getMyCourses(studentId);

      expect(mockEnrollmentRepo.findMany).toHaveBeenCalled();
      expect(mockCourseRepo.getVersionById).toHaveBeenCalledWith(versionId);

      expect(result.length).toBe(1);
      expect(result[0].totalLessons).toBe(5); // Locked to the snapshot, NOT the live DB which might have 7
      expect(result[0].completedLessons).toBe(2);
      expect(result[0].progress).toBe(40); // 2/5 = 40%
    });

    it('Phase 2: Student tracks progress properly within their version limit', async () => {
      /**
       * SCENARIO:
       * Student watches lesson completely.
       * Service verifies they are enrolled, updates progress, and emits GAMIFICATION events.
       */

      // Mock lesson lookup
      mockLessonRepo.findById.mockResolvedValue({
        id: lessonId,
        moduleId: 'mod-1',
        requiresPassingGrade: false,
      });
      mockModuleRepo.findById.mockResolvedValue({
        id: 'mod-1',
        courseMasterId: courseMasterId,
      });

      // Mock enrollment
      mockEnrollmentRepo.findByUserAndCourseMaster.mockResolvedValue({
        id: enrollmentId,
        courseRunId: 'run-1',
        expiresAt: null, // Active
      });

      mockProgressRepo.countCompletedLessons.mockResolvedValue(3); // Now they finished 3
      mockLessonRepo.count.mockResolvedValue(5); // Live query fallback or live count check

      await service.trackLessonProgress(studentId, lessonId, 200, 200);

      // Verify progress marked as completed
      expect(mockProgressRepo.upsert).toHaveBeenCalledWith(
        enrollmentId,
        lessonId,
        expect.objectContaining({ status: 'completed' }), // Complete because watched 100%
        expect.any(Object),
      );

      // Gamification Events
      expect(mockNatsClient.emit).toHaveBeenCalledWith(
        'user.activity',
        expect.objectContaining({
          activityType: 'VIDEO_WATCH',
        }),
      );
      expect(mockNatsClient.emit).toHaveBeenCalledWith(
        'user.activity',
        expect.objectContaining({
          activityType: 'LESSON_COMPLETE',
        }),
      );
    });

    it('Phase 3: Student hits expiration date limit', async () => {
      // Mock lesson lookup
      mockLessonRepo.findById.mockResolvedValue({
        id: lessonId,
        moduleId: 'mod-1',
        requiresPassingGrade: false,
      });
      mockModuleRepo.findById.mockResolvedValue({
        id: 'mod-1',
        courseMasterId: courseMasterId,
      });

      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1); // Expired 1 month ago

      // Mock enrollment
      mockEnrollmentRepo.findByUserAndCourseMaster.mockResolvedValue({
        id: enrollmentId,
        courseRunId: 'run-1',
        expiresAt: pastDate, // EXPIRED
      });

      await expect(
        service.trackLessonProgress(studentId, lessonId, 100, 100),
      ).rejects.toThrow('Course access has expired');

      // Should not save
      expect(mockProgressRepo.upsert).not.toHaveBeenCalled();
    });

    it('Phase 4: Course Completion triggers Certificate generation automatically', async () => {
      mockLessonRepo.findById.mockResolvedValue({
        id: lessonId,
        moduleId: 'mod-1',
        requiresPassingGrade: false,
      });
      mockModuleRepo.findById.mockResolvedValue({
        id: 'mod-1',
        courseMasterId,
      });

      mockEnrollmentRepo.findByUserAndCourseMaster.mockResolvedValue({
        id: enrollmentId,
        courseRunId: 'run-1',
      });

      // Make it so that completing this lesson makes the total match published
      mockLessonRepo.count.mockResolvedValue(5); // total lessons
      mockProgressRepo.countCompletedLessons.mockResolvedValue(5); // user finished 5

      await service.trackLessonProgress(studentId, lessonId, 200, 200);

      // Expect update enrollment to 100% and STATUS COMPLETED
      expect(mockEnrollmentRepo.update).toHaveBeenCalledWith(
        enrollmentId,
        expect.objectContaining({
          completionPercentage: 100,
          completionStatus: EnrollmentStatus.COMPLETED,
        }),
      );

      // Ensure certificate was issued
      expect(mockCertificateService.issueCertificate).toHaveBeenCalledWith(
        studentId,
        courseMasterId,
        enrollmentId,
      );
    });

    it('Phase 5: Prevent lesson completion if Quizzes are required but not passed', async () => {
      // Mock lesson requiring passing grade
      mockLessonRepo.findById.mockResolvedValue({
        id: lessonId,
        moduleId: 'mod-1',
        requiresPassingGrade: true,
      });
      mockModuleRepo.findById.mockResolvedValue({
        id: 'mod-1',
        courseMasterId,
      });

      mockEnrollmentRepo.findByUserAndCourseMaster.mockResolvedValue({
        id: enrollmentId,
        courseRunId: 'run-1',
      });

      // Mock quizzes for this lesson
      mockPrismaService.quiz.findMany.mockResolvedValue([{ id: 'quiz-1' }]);

      // Mock that NO passed attempts exist
      mockPrismaService.quizAttempt.findMany.mockResolvedValue([]);

      await service.trackLessonProgress(studentId, lessonId, 100, 100);

      // Progress should save as in_progress NOT completed
      expect(mockProgressRepo.upsert).toHaveBeenCalledWith(
        enrollmentId,
        lessonId,
        expect.objectContaining({ status: 'in_progress' }),
        expect.any(Object),
      );
    });
  });
});
