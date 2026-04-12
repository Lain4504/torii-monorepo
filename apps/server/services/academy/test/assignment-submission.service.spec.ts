import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssignmentSubmissionService } from '../src/modules/assessment/assignment-submission/assignment-submission.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';

describe('AssignmentSubmissionService', () => {
  let service: AssignmentSubmissionService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(async () => {
    mockPrisma = {
      assignmentSubmission: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      liveClassAssignment: {
        findUnique: jest.fn(),
      },
    };

    mockAudit = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentSubmissionService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: AuditLoggerService,
          useValue: mockAudit,
        },
      ],
    }).compile();

    service = module.get<AssignmentSubmissionService>(AssignmentSubmissionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return parsed submissions for a user', async () => {
      const mockResult = [
        {
          id: 's1',
          userId: 'u1',
          content: '{"foo":"bar"}',
          liveClassAssignment: { id: 'lca1', liveClassId: 'lc1', assignmentId: 'a1' },
        },
      ];
      mockPrisma.assignmentSubmission.findMany.mockResolvedValue(mockResult);

      const result = await service.findAll({ userId: 'u1' });

      expect(result[0].content).toEqual({ foo: 'bar' });
      expect(result[0].classId).toBe('lc1');
    });
  });

  describe('findById', () => {
    it('should throw NotFound if missing', async () => {
      mockPrisma.assignmentSubmission.findUnique.mockResolvedValue(null);
      await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequest if student tries to access others submission', async () => {
      mockPrisma.assignmentSubmission.findUnique.mockResolvedValue({ id: 's1', userId: 'other' });
      await expect(service.findById('s1', 'student-1')).rejects.toThrow(BadRequestException);
    });

    it('should return submission for owner', async () => {
      mockPrisma.assignmentSubmission.findUnique.mockResolvedValue({ id: 's1', userId: 'u1', content: null });
      const result = await service.findById('s1', 'u1');
      expect(result.id).toBe('s1');
    });

    it('should return submission for manager regardless of ownership', async () => {
      mockPrisma.assignmentSubmission.findUnique.mockResolvedValue({ id: 's1', userId: 'other', content: null });
      const result = await service.findById('s1', 'manager-1', true);
      expect(result.id).toBe('s1');
    });
  });

  describe('create', () => {
    it('should throw if userId is missing', async () => {
      await expect(service.create({} as any)).rejects.toThrow('Missing userId');
    });

    it('should throw if trying to create for another user', async () => {
      await expect(service.create({ userId: 'other' } as any, 'me')).rejects.toThrow('You can only create submissions for yourself');
    });

    it('should throw if classAssessmentId is invalid', async () => {
      mockPrisma.liveClassAssignment.findUnique.mockResolvedValue(null);
      await expect(service.create({ userId: 'u1', classAssessmentId: 'bad' } as any, 'u1')).rejects.toThrow('Invalid classAssessmentId');
    });

    it('should throw if already submitted', async () => {
      mockPrisma.liveClassAssignment.findUnique.mockResolvedValue({ id: 'ca1' });
      mockPrisma.assignmentSubmission.findFirst.mockResolvedValue({ id: 'existing' });
      await expect(service.create({ userId: 'u1', classAssessmentId: 'ca1' } as any, 'u1')).rejects.toThrow('already submitted');
    });

    it('should successfully create and return result', async () => {
      mockPrisma.liveClassAssignment.findUnique.mockResolvedValue({ id: 'ca1' });
      mockPrisma.assignmentSubmission.findFirst.mockResolvedValue(null);
      mockPrisma.assignmentSubmission.create.mockResolvedValue({ id: 'new-id', content: '{}' });
      
      // create() calls findById() at the end
      mockPrisma.assignmentSubmission.findUnique.mockResolvedValue({ 
        id: 'new-id', 
        userId: 'u1', 
        content: '{}',
        liveClassAssignment: { id: 'ca1', liveClassId: 'lc1', assignmentId: 'a1' }
      });

      const result = await service.create({ userId: 'u1', classAssessmentId: 'ca1', content: { test: 1 } } as any, 'u1');

      expect(mockPrisma.assignmentSubmission.create).toHaveBeenCalled();
      expect(result.id).toBe('new-id');
    });
  });

  describe('update', () => {
    it('should update and log audit if score provided', async () => {
      mockPrisma.assignmentSubmission.findUnique.mockResolvedValue({ id: 's1', userId: 'u1' });
      mockPrisma.assignmentSubmission.update.mockResolvedValue({ id: 's1', grade: '90' });

      await service.update('s1', { score: 90 }, 'manager-1', true);

      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'assignment_submission.grade',
      }));
    });
  });

  describe('delete', () => {
    it('should delete and log audit', async () => {
      mockPrisma.assignmentSubmission.findUnique.mockResolvedValue({ id: 's1', userId: 'u1' });
      
      await service.delete('s1', 'manager-1', true);

      expect(mockPrisma.assignmentSubmission.delete).toHaveBeenCalledWith({ where: { id: 's1' } });
      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'assignment_submission.delete',
      }));
    });
  });
});
