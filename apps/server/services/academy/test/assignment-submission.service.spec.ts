import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentSubmissionService } from '../src/modules/assessment/assignment-submission/assignment-submission.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';
import { BadRequestException } from '@nestjs/common';

describe('AssignmentSubmissionService', () => {
  let service: AssignmentSubmissionService;
  let prisma: any;
  let mockAudit: any;

  beforeEach(async () => {
    const mockPrisma = {
      assignmentSubmission: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 's1' }),
        update: jest.fn().mockResolvedValue({ id: 's1', grade: { toString: () => '95' } }),
        delete: jest.fn(),
      },
      liveClassAssignment: {
        findUnique: jest.fn().mockResolvedValue({ id: 'a1' }),
      },
    };

    mockAudit = { log: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentSubmissionService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLoggerService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<AssignmentSubmissionService>(AssignmentSubmissionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should throw error if user already submitted', async () => {
      prisma.assignmentSubmission.findFirst.mockResolvedValueOnce({ id: 'existing' });
      await expect(service.create({ userId: 'u1', classAssessmentId: 'a1' }, 'u1'))
        .rejects.toThrow('already submitted this assignment');
    });

    it('should successfuly create submission as user', async () => {
      const result = await service.create({ userId: 'u1', classAssessmentId: 'a1' }, 'u1');
      expect(prisma.assignmentSubmission.create).toHaveBeenCalled();
      expect(result.id).toBe('s1');
    });
  });

  describe('update', () => {
    it('should update grade and log audit', async () => {
      prisma.assignmentSubmission.findUnique.mockResolvedValueOnce({ id: 's1', userId: 'u1' });
      await service.update('s1', { score: 95, feedback: 'Good job' }, 'teacher1', true);
      expect(prisma.assignmentSubmission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ feedback: 'Good job' })
        })
      );
      expect(mockAudit.log).toHaveBeenCalled();
    });
  });
});
