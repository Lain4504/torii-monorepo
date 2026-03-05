import { Test, TestingModule } from '@nestjs/testing';
import { LessonService } from '@server/learning/modules/lesson/lesson.service';
import {
  LESSON_REPOSITORY_TOKEN,
  MODULE_REPOSITORY_TOKEN,
} from '@server/learning/interfaces/repositories';
import {
  COURSE_MASTER_SERVICE_TOKEN,
  ENROLLMENT_SERVICE_TOKEN,
} from '@server/learning/interfaces/services';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@workspace/schemas';
import { getMapperToken } from '@automapper/nestjs';

const mockMapper = {
  map: jest.fn().mockImplementation((val) => (val ? { ...val } : val)),
};

describe('LessonService', () => {
  let service: LessonService;
  let lessonRepository: any;
  let moduleRepository: any;
  let courseMasterService: any;
  let enrollmentService: any;
  let natsClient: any;

  const mockLessonRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    findByModuleId: jest.fn(),
    getMaxOrderIndex: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    delete: jest.fn(),
    reorder: jest.fn(),
    count: jest.fn(),
  };

  const mockModuleRepository = {
    findById: jest.fn(),
  };

  const mockCourseMasterService = {
    findById: jest.fn(),
    recalculateStats: jest.fn(),
    isInstructor: jest.fn(),
  };

  const mockEnrollmentService = {
    isEnrolled: jest.fn(),
  };

  const mockNatsClient = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonService,
        { provide: LESSON_REPOSITORY_TOKEN, useValue: mockLessonRepository },
        { provide: MODULE_REPOSITORY_TOKEN, useValue: mockModuleRepository },
        {
          provide: COURSE_MASTER_SERVICE_TOKEN,
          useValue: mockCourseMasterService,
        },
        { provide: ENROLLMENT_SERVICE_TOKEN, useValue: mockEnrollmentService },
        { provide: 'NATS_SERVICE', useValue: mockNatsClient },
        { provide: getMapperToken(), useValue: mockMapper },
      ],
    }).compile();

    service = module.get<LessonService>(LessonService);
    lessonRepository = module.get(LESSON_REPOSITORY_TOKEN);
    moduleRepository = module.get(MODULE_REPOSITORY_TOKEN);
    courseMasterService = module.get(COURSE_MASTER_SERVICE_TOKEN);
    enrollmentService = module.get(ENROLLMENT_SERVICE_TOKEN);
    natsClient = module.get('NATS_SERVICE');

    jest.clearAllMocks();
  });

  it('nên được định nghĩa', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      moduleId: 'mod-1',
      title: 'Lesson 1',
      contentType: 'video',
      videoUrl: 'http://video.com',
    };
    const requester = { sub: 'user-1', role: UserRole.STAFF, permissions: [] };

    it('nên tạo bài học thành công cho VOD course', async () => {
      mockModuleRepository.findById.mockResolvedValue({
        id: 'mod-1',
        courseId: 'course-1',
      });
      mockCourseMasterService.findById.mockResolvedValue({
        id: 'course-1',
        type: 'vod',
      });
      mockLessonRepository.getMaxOrderIndex.mockResolvedValue(5);
      mockLessonRepository.create.mockResolvedValue({
        id: 'les-1',
        ...dto,
        orderIndex: 6,
      });

      const result = await service.create(requester as any, dto as any);

      expect(result).toBeDefined();
      expect(lessonRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderIndex: 6,
          createdBy: 'user-1',
        }),
      );
      expect(mockNatsClient.emit).toHaveBeenCalled();
    });

    it('nên báo lỗi khi tạo bài học Video cho LIVE course (Business Logic Check)', async () => {
      mockModuleRepository.findById.mockResolvedValue({
        id: 'mod-1',
        courseId: 'course-1',
      });
      mockCourseMasterService.findById.mockResolvedValue({
        id: 'course-1',
        type: 'live',
      });

      await expect(
        service.create(requester as any, dto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('nên báo lỗi khi không tìm thấy Module', async () => {
      mockModuleRepository.findById.mockResolvedValue(null);

      await expect(
        service.create(requester as any, dto as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('nên trả về đầy đủ videoUrl nếu người dùng đã đăng ký học', async () => {
      const lesson = {
        id: 'les-1',
        moduleId: 'mod-1',
        contentType: 'video',
        videoUrl: 'private-url',
        isPreview: false,
        isUnlocked: true,
      };
      mockLessonRepository.findById.mockResolvedValue(lesson);
      mockModuleRepository.findById.mockResolvedValue({ courseId: 'course-1' });
      mockEnrollmentService.isEnrolled.mockResolvedValue(true);
      const requester = {
        sub: 'user-student',
        role: 'LEARNER' as any,
        permissions: [],
      };

      const result = await service.findById('les-1', requester);

      expect(result.videoUrl).toBe('private-url');
    });

    it('nên ẩn videoUrl nếu bài học không phải preview và người dùng chưa đăng ký học', async () => {
      const lesson = {
        id: 'les-1',
        moduleId: 'mod-1',
        contentType: 'video',
        videoUrl: 'private-url',
        isPreview: false,
        isUnlocked: true,
      };
      mockLessonRepository.findById.mockResolvedValue(lesson);
      mockModuleRepository.findById.mockResolvedValue({ courseId: 'course-1' });
      mockEnrollmentService.isEnrolled.mockResolvedValue(false);
      const requester = {
        sub: 'user-stranger',
        role: 'LEARNER' as any,
        permissions: [],
      };

      const result = await service.findById('les-1', requester);

      expect(result.videoUrl).toBeUndefined();
    });

    it('nên trả về đầy đủ nội dung nếu là Staff/Admin (Bypass enrollment)', async () => {
      const lesson = {
        id: 'les-1',
        moduleId: 'mod-1',
        contentType: 'video',
        videoUrl: 'private-url',
        isPreview: false,
        isUnlocked: true,
      };
      mockLessonRepository.findById.mockResolvedValue(lesson);
      const requester = {
        sub: 'admin-1',
        role: 'ADMIN' as any,
        permissions: ['lesson.update'],
      };

      const result = await service.findById('les-1', requester);

      expect(result.videoUrl).toBe('private-url');
      expect(mockEnrollmentService.isEnrolled).not.toHaveBeenCalled();
    });

    it('nên đồng nhất isUnlocked: false nếu người dùng chưa đăng ký học (Fix UI Inconsistency)', async () => {
      const lesson = {
        id: 'les-1',
        moduleId: 'mod-1',
        contentType: 'video',
        videoUrl: 'private-url',
        isPreview: false,
        isUnlocked: true,
      };
      mockLessonRepository.findById.mockResolvedValue(lesson);
      mockModuleRepository.findById.mockResolvedValue({ courseId: 'course-1' });
      mockEnrollmentService.isEnrolled.mockResolvedValue(false);
      const requester = {
        sub: 'user-stranger',
        role: 'LEARNER' as any,
        permissions: [],
      };

      const result = await service.findById('les-1', requester);

      expect(result.isUnlocked).toBe(false);
      expect(result.videoUrl).toBeUndefined();
    });

    it('nên ẩn nội dung nếu bài học bị khóa bởi Admin (isUnlocked = false) ngay cả khi đã đăng ký', async () => {
      const lesson = {
        id: 'les-1',
        moduleId: 'mod-1',
        contentType: 'video',
        videoUrl: 'private-url',
        isPreview: false,
        isUnlocked: false,
      };
      mockLessonRepository.findById.mockResolvedValue(lesson);
      mockModuleRepository.findById.mockResolvedValue({ courseId: 'course-1' });
      mockEnrollmentService.isEnrolled.mockResolvedValue(true);
      const requester = {
        sub: 'user-student',
        role: 'LEARNER' as any,
        permissions: [],
      };

      const result = await service.findById('les-1', requester);

      expect(result.isUnlocked).toBe(false);
      expect(result.videoUrl).toBeUndefined();
    });
  });

  describe('update', () => {
    const updateDto = { title: 'Updated Title' };
    const requester = {
      sub: 'inst-1',
      role: UserRole.LECTURER,
      permissions: ['lesson.update'],
    };

    it('nên cập nhật thành công nếu là giáo viên được gán cho khóa học', async () => {
      const existing = { id: 'les-1', moduleId: 'mod-1', courseId: 'course-1' };
      mockLessonRepository.findById.mockResolvedValue(existing);
      mockModuleRepository.findById.mockResolvedValue({ courseId: 'course-1' });
      mockCourseMasterService.isInstructor.mockResolvedValue(true);
      mockLessonRepository.update.mockResolvedValue({
        ...existing,
        title: 'Updated Title',
      });

      const result = await service.update(requester as any, 'les-1', updateDto);

      expect(result.title).toBe('Updated Title');
    });

    it('nên chặn cập nhật nếu không phải giáo viên phụ trách và không phải Admin', async () => {
      const existing = { id: 'les-1', moduleId: 'mod-1' };
      mockLessonRepository.findById.mockResolvedValue(existing);
      mockModuleRepository.findById.mockResolvedValue({ courseId: 'course-1' });
      mockCourseMasterService.isInstructor.mockResolvedValue(false); // Không phải chủ khóa học

      await expect(
        service.update(requester as any, 'les-1', updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    const requester = {
      sub: 'admin-1',
      role: UserRole.ADMIN,
      permissions: ['*'],
    };

    it('nên thực hiện soft delete bài học', async () => {
      mockLessonRepository.findById.mockResolvedValue({
        id: 'les-1',
        title: 'Test',
      });
      mockLessonRepository.softDelete.mockResolvedValue({ id: 'les-1' });
      mockModuleRepository.findById.mockResolvedValue({ courseId: 'course-1' });

      const result = await service.delete(requester as any, 'les-1');

      expect(result.message).toContain('successfully');
      expect(mockLessonRepository.softDelete).toHaveBeenCalled();
    });

    it('nên báo lỗi nếu bài học không tồn tại', async () => {
      mockLessonRepository.findById.mockResolvedValue(null);

      await expect(
        service.delete(requester as any, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
  describe('findByModuleId - Content Protection', () => {
    const moduleId = 'mod-1';

    const lessons = [
      {
        id: 'les-1',
        moduleId,
        contentType: 'article',
        videoUrl: null,
        articleContent: 'secret article',
        isPreview: false,
        isUnlocked: true,
      },
      {
        id: 'les-2',
        moduleId,
        contentType: 'video',
        videoUrl: 'secret-url',
        articleContent: null,
        isPreview: true,
        isUnlocked: true,
      },
    ];

    beforeEach(() => {
      mockLessonRepository.findByModuleId.mockResolvedValue(lessons);
      mockModuleRepository.findById.mockResolvedValue({ courseId: 'course-1' });
    });

    it('Learner chưa enrolled: nên ẩn articleContent và videoUrl của bài không phải preview', async () => {
      mockEnrollmentService.isEnrolled.mockResolvedValue(false);
      const requester = {
        sub: 'user-1',
        role: 'LEARNER' as any,
        permissions: [],
      };

      const result = await service.findByModuleId(moduleId, requester);
      const nonPreview = result.find((l) => l.id === 'les-1');
      const preview = result.find((l) => l.id === 'les-2');

      expect(nonPreview?.articleContent).toBeUndefined();
      expect(nonPreview?.isUnlocked).toBe(false);
      // Preview lesson vẫn hiển thị bình thường
      expect(preview?.isUnlocked).toBe(true);
    });

    it('Learner đã enrolled: nên nhận đầy đủ nội dung', async () => {
      mockEnrollmentService.isEnrolled.mockResolvedValue(true);
      const requester = {
        sub: 'user-1',
        role: 'LEARNER' as any,
        permissions: [],
      };

      const result = await service.findByModuleId(moduleId, requester);
      const nonPreview = result.find((l) => l.id === 'les-1');

      expect(nonPreview?.articleContent).toBe('secret article');
      expect(nonPreview?.isUnlocked).toBe(true);
    });

    it('Staff: luôn nhận đầy đủ nội dung mà không cần kiểm tra enrollment', async () => {
      const requester = {
        sub: 'staff-1',
        role: 'STAFF' as any,
        permissions: ['lesson.create'],
      };

      const result = await service.findByModuleId(moduleId, requester);

      expect(result[0].articleContent).toBe('secret article');
      // Staff không cần gọi isEnrolled
      expect(mockEnrollmentService.isEnrolled).not.toHaveBeenCalled();
    });

    it('Không có requester (public): tất cả bài không phải preview đều bị ẩn nội dung', async () => {
      const result = await service.findByModuleId(moduleId, undefined);
      const nonPreview = result.find((l) => l.id === 'les-1');

      expect(nonPreview?.articleContent).toBeUndefined();
      expect(nonPreview?.isUnlocked).toBe(false);
    });
  });
});
