import { Test, TestingModule } from '@nestjs/testing';
import { LearningProgressService } from '@server/learning/modules/learning-progress/learning-progress.service';
import {
  LEARNING_PROGRESS_REPOSITORY_TOKEN,
  ENROLLMENT_REPOSITORY_TOKEN,
  COURSE_MASTER_REPOSITORY_TOKEN,
  LESSON_REPOSITORY_TOKEN,
  MODULE_REPOSITORY_TOKEN,
} from '@server/learning/interfaces/repositories';
import { CERTIFICATE_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { EnrollmentStatus } from '@workspace/schemas';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('LearningProgressService', () => {
  let service: LearningProgressService;
  let progressRepo: any;
  let enrollmentRepo: any;
  let courseRepo: any;
  let lessonRepo: any;
  let moduleRepo: any;
  let certificateService: any;
  let natsClient: any;

  const mockEnrollment = {
    id: 'e-1',
    userId: 'u-1',
    courseId: 'c-1',
    completionPercentage: 0,
    completionStatus: EnrollmentStatus.IN_PROGRESS,
    course: { id: 'c-1', title: 'Course', slug: 'slug' },
  };

  const mockLesson = { id: 'l-1', moduleId: 'm-1', title: 'Lesson' };
  const mockModule = { id: 'm-1', courseId: 'c-1' };

  const mockProgressRepo = {
    countCompletedLessons: jest.fn(),
    upsert: jest.fn(),
    getTotalLearningSeconds: jest.fn(),
    getCompletedLessonIds: jest.fn(),
    findRecentProgress: jest.fn(),
  };

  const mockEnrollmentRepo = {
    findMany: jest.fn(),
    findById: jest.fn(),
    findByUserAndCourse: jest.fn(),
    update: jest.fn().mockResolvedValue({}),
  };

  const mockCourseRepo = {
    getVersionById: jest.fn(),
    findById: jest.fn(),
  };

  const mockLessonRepo = {
    findById: jest.fn(),
    count: jest.fn(),
  };

  const mockModuleRepo = {
    findById: jest.fn(),
  };

  const mockCertificateService = {
    issueCertificate: jest.fn().mockResolvedValue({}),
  };

  const mockNatsClient = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningProgressService,
        {
          provide: LEARNING_PROGRESS_REPOSITORY_TOKEN,
          useValue: mockProgressRepo,
        },
        {
          provide: ENROLLMENT_REPOSITORY_TOKEN,
          useValue: mockEnrollmentRepo,
        },
        {
          provide: COURSE_MASTER_REPOSITORY_TOKEN,
          useValue: mockCourseRepo,
        },
        {
          provide: LESSON_REPOSITORY_TOKEN,
          useValue: mockLessonRepo,
        },
        {
          provide: MODULE_REPOSITORY_TOKEN,
          useValue: mockModuleRepo,
        },
        {
          provide: CERTIFICATE_SERVICE_TOKEN,
          useValue: mockCertificateService,
        },
        {
          provide: 'NATS_SERVICE',
          useValue: mockNatsClient,
        },
      ],
    }).compile();

    service = module.get<LearningProgressService>(LearningProgressService);
    progressRepo = module.get(LEARNING_PROGRESS_REPOSITORY_TOKEN);
    enrollmentRepo = module.get(ENROLLMENT_REPOSITORY_TOKEN);
    courseRepo = module.get(COURSE_MASTER_REPOSITORY_TOKEN);
    lessonRepo = module.get(LESSON_REPOSITORY_TOKEN);
    moduleRepo = module.get(MODULE_REPOSITORY_TOKEN);
    certificateService = module.get(CERTIFICATE_SERVICE_TOKEN);
    natsClient = module.get('NATS_SERVICE');

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMyCourses', () => {
    it('should return user courses with progress', async () => {
      const enrollments = [
        {
          ...mockEnrollment,
          course: {
            ...mockEnrollment.course,
            thumbnailUrl: 'thumb',
            type: 'vod',
          },
        },
      ];
      mockEnrollmentRepo.findMany.mockResolvedValue(enrollments);
      mockProgressRepo.countCompletedLessons.mockResolvedValue(1);
      mockLessonRepo.count.mockResolvedValue(2);

      const result = await service.getMyCourses('u-1');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      if (result.length > 0) {
        expect(result[0].progress).toBe(50);
        expect(result[0].totalLessons).toBe(2);
        expect(result[0].completedLessons).toBe(1);
      }
    });
  });

  describe('trackLessonProgress', () => {
    it('should track progress successfully', async () => {
      mockLessonRepo.findById.mockResolvedValue(mockLesson);
      mockModuleRepo.findById.mockResolvedValue(mockModule);
      mockEnrollmentRepo.findByUserAndCourse.mockResolvedValue(mockEnrollment);
      mockLessonRepo.count.mockResolvedValue(10);
      mockProgressRepo.countCompletedLessons.mockResolvedValue(1);

      const result = await service.trackLessonProgress('u-1', 'l-1', 100, 200);

      expect(result.success).toBe(true);
      expect(progressRepo.upsert).toHaveBeenCalled();
      expect(enrollmentRepo.update).toHaveBeenCalled();
    });

    it('should issue certificate if progress reaches 100%', async () => {
      mockLessonRepo.findById.mockResolvedValue(mockLesson);
      mockModuleRepo.findById.mockResolvedValue(mockModule);
      mockEnrollmentRepo.findByUserAndCourse.mockResolvedValue(mockEnrollment);
      mockLessonRepo.count.mockResolvedValue(1);
      mockProgressRepo.countCompletedLessons.mockResolvedValue(1);

      // Mock upsert to avoid issues
      mockProgressRepo.upsert.mockResolvedValue({});
      mockEnrollmentRepo.update.mockResolvedValue({});

      await service.trackLessonProgress('u-1', 'l-1', 190, 200);

      expect(certificateService.issueCertificate).toHaveBeenCalled();
    });
  });

  describe('getUserLearningStats', () => {
    it('should return learning stats', async () => {
      mockEnrollmentRepo.findMany.mockResolvedValue([mockEnrollment]);
      mockProgressRepo.getTotalLearningSeconds.mockResolvedValue(3600);

      const result = await service.getUserLearningStats('u-1');

      expect(result.totalLearningHours).toBe(1);
      expect(result.totalCourses).toBe(1);
    });
  });

  describe('getCompletedLessons', () => {
    it('should return completed lesson IDs', async () => {
      mockEnrollmentRepo.findByUserAndCourse.mockResolvedValue(mockEnrollment);
      mockProgressRepo.getCompletedLessonIds.mockResolvedValue(['l-1']);

      const result = await service.getCompletedLessons('u-1', 'c-1');

      expect(result).toEqual(['l-1']);
    });
  });

  describe('getLearningHistory', () => {
    it('should return recent progress history', async () => {
      const historyItem = {
        lessonId: 'l-1',
        lastWatchedAt: new Date(),
        watchedDuration: 120,
        lesson: { title: 'Lesson' },
        enrollment: {
          course: { id: 'c-1', title: 'Course', slug: 'slug' },
          expiresAt: null,
        },
      };
      mockProgressRepo.findRecentProgress.mockResolvedValue([historyItem]);

      const result = await service.getLearningHistory('u-1');

      expect(result).toHaveLength(1);
      expect(result[0].lessonTitle).toBe('Lesson');
      expect(result[0].courseTitle).toBe('Course');
    });
  });
});
