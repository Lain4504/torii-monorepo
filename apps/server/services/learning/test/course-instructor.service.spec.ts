// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { CourseInstructorService } from '@server/learning/modules/course-instructor/course-instructor/course-instructor.service';
import { COURSE_RUN_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { PrismaService } from '@server/shared';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from '@workspace/schemas';

describe('CourseInstructorService', () => {
  let service: CourseInstructorService;
  let courseInstructorRepository: any;
  let prisma: any;
  let natsClient: any;

  const mockInstructor = {
    id: 'instr-1',
    courseMasterId: 'cm1',
    lecturerId: 'lect-1',
    role: 'INSTRUCTOR',
    isPrimary: true,
    assignedDate: new Date(),
  };

  const mockRequester = {
    sub: 'admin-1',
    role: UserRole.ADMIN,
  };

  const mockCourseInstructorRepository = {
    checkAssignment: jest.fn(),
    assign: jest.fn(),
    findByCourseId: jest.fn(),
    findByLecturerId: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    unassign: jest.fn(),
  };

  const mockPrismaService = {
    course: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockNatsClient = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseInstructorService,
        {
          provide: COURSE_RUN_REPOSITORY_TOKEN,
          useValue: mockCourseInstructorRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'NATS_SERVICE',
          useValue: mockNatsClient,
        },
      ],
    }).compile();

    service = module.get<CourseInstructorService>(CourseInstructorService);
    courseInstructorRepository = module.get(COURSE_RUN_REPOSITORY_TOKEN);
    prisma = module.get(PrismaService);
    natsClient = module.get('NATS_SERVICE');

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignLecturer', () => {
    const dto = {
      courseMasterId: 'cm1',
      lecturerId: 'lect-1',
      role: 'INSTRUCTOR',
    };

    it('should assign lecturer successfully', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue({ id: 'course-1' });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'lect-1',
        role: 'LECTURER',
      });
      mockCourseInstructorRepository.checkAssignment.mockResolvedValue(null);
      mockCourseInstructorRepository.assign.mockResolvedValue(mockInstructor);

      const result = await service.assignLecturer(
        mockRequester as any,
        dto as any,
      );

      expect(result.id).toBe(mockInstructor.id);
      expect(courseInstructorRepository.assign).toHaveBeenCalled();
      expect(natsClient.emit).toHaveBeenCalledWith(
        { cmd: 'course.instructor.assigned' },
        expect.any(Object),
      );
    });

    it('should throw ForbiddenException if requester is not admin or staff', async () => {
      const studentRequester = { sub: 'u1', role: UserRole.LEARNER };
      await expect(
        service.assignLecturer(studentRequester as any, dto as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if course does not exist', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);
      await expect(
        service.assignLecturer(mockRequester as any, dto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user is not a lecturer', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue({ id: 'course-1' });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'lect-1',
        role: 'LEARNER',
      });
      await expect(
        service.assignLecturer(mockRequester as any, dto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getInstructorsByCourse', () => {
    it('should return instructors for a course', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue({ id: 'course-1' });
      mockCourseInstructorRepository.findByCourseId.mockResolvedValue([
        mockInstructor,
      ]);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'lect-1',
        displayName: 'John',
      });

      const result = await service.getInstructorsByCourse('course-1');

      expect(result).toHaveLength(1);
      expect(result[0].lecturer?.displayName).toBe('John');
    });
  });

  describe('unassignLecturer', () => {
    it('should unassign lecturer successfully', async () => {
      mockCourseInstructorRepository.findById.mockResolvedValue(mockInstructor);
      mockCourseInstructorRepository.unassign.mockResolvedValue({
        id: 'instr-1',
      });

      const result = await service.unassignLecturer(
        mockRequester as any,
        'instr-1',
      );

      expect(result.message).toContain('successfully');
      expect(courseInstructorRepository.unassign).toHaveBeenCalled();
    });

    it('should throw NotFoundException if assignment not found', async () => {
      mockCourseInstructorRepository.findById.mockResolvedValue(null);
      await expect(
        service.unassignLecturer(mockRequester as any, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
