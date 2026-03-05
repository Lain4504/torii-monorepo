import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionService } from '@server/learning/modules/submission/submission.service';
import { SubmissionRepository } from '@server/learning/modules/submission/submission.repository';
import { AssignmentRepository } from '@server/learning/modules/assignment/assignment.repository';
import { getMapperToken } from '@automapper/nestjs';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  UserRole,
  SubmissionStatus,
  AssignmentStatus,
  AssignmentType,
} from '@workspace/schemas';

describe('SubmissionService', () => {
  let service: SubmissionService;
  let submissionRepository: any;
  let assignmentRepository: any;
  let natsClient: any;
  let mapper: any;

  const mockAssignment = {
    id: 'a-1',
    status: AssignmentStatus.PUBLISHED,
    type: AssignmentType.TEXT,
    maxScore: 100,
    passingScore: 50,
    createdBy: 'staff-1',
  };

  const mockSubmission = {
    id: 's-1',
    assignmentId: 'a-1',
    userId: 'user-1',
    status: SubmissionStatus.SUBMITTED,
    attemptNumber: 1,
    score: null,
  };

  const mockRequester = {
    sub: 'user-1',
    role: UserRole.LEARNER,
    permissions: [],
  };

  const mockStaffRequester = {
    sub: 'staff-1',
    role: UserRole.STAFF,
    permissions: ['assignment.grade'],
  };

  const mockSubmissionRepository = {
    findByAssignmentAndUser: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    createGradeHistory: jest.fn(),
    findByAssignmentId: jest.fn(),
  };

  const mockAssignmentRepository = {
    findById: jest.fn(),
  };

  const mockNatsClient = {
    emit: jest.fn(),
  };

  const mockMapper = {
    map: jest.fn().mockImplementation((val) => (val ? { ...val } : val)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionService,
        {
          provide: SubmissionRepository,
          useValue: mockSubmissionRepository,
        },
        {
          provide: AssignmentRepository,
          useValue: mockAssignmentRepository,
        },
        {
          provide: 'NATS_SERVICE',
          useValue: mockNatsClient,
        },
        {
          provide: getMapperToken(),
          useValue: mockMapper,
        },
      ],
    }).compile();

    service = module.get<SubmissionService>(SubmissionService);
    submissionRepository = module.get(SubmissionRepository);
    assignmentRepository = module.get(AssignmentRepository);
    natsClient = module.get('NATS_SERVICE');
    mapper = module.get(getMapperToken());

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveDraft', () => {
    it('should create a new draft if none exists', async () => {
      mockAssignmentRepository.findById.mockResolvedValue(mockAssignment);
      mockSubmissionRepository.findByAssignmentAndUser.mockResolvedValue(null);
      mockSubmissionRepository.create.mockResolvedValue({
        ...mockSubmission,
        status: SubmissionStatus.DRAFT,
      });

      const result = await service.saveDraft(
        mockRequester as any,
        '00000000-0000-0000-0000-000000000000',
        {
          textAnswer: 'Draft',
          fileUrls: [],
        },
      );

      expect(result.status).toBe(SubmissionStatus.DRAFT);
      expect(submissionRepository.create).toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('should submit assignment officially', async () => {
      mockAssignmentRepository.findById.mockResolvedValue(mockAssignment);
      mockSubmissionRepository.findByAssignmentAndUser.mockResolvedValue(null);
      mockSubmissionRepository.create.mockResolvedValue(mockSubmission);

      const result = await service.submit(
        mockRequester as any,
        '00000000-0000-0000-0000-000000000000',
        {
          textAnswer: 'Final Answer',
          fileUrls: [],
        },
      );

      expect(result.status).toBe(SubmissionStatus.SUBMITTED);
      expect(natsClient.emit).toHaveBeenCalledWith(
        'submission.submitted',
        expect.any(Object),
      );
    });

    it('should throw BadRequestException if text answer missing for TEXT assignment', async () => {
      mockAssignmentRepository.findById.mockResolvedValue(mockAssignment);
      await expect(
        service.submit(
          mockRequester as any,
          '00000000-0000-0000-0000-000000000000',
          {
            textAnswer: '',
            fileUrls: [],
          },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('grade', () => {
    it('should grade submission if requester has permission', async () => {
      mockSubmissionRepository.findById.mockResolvedValue(mockSubmission);
      mockAssignmentRepository.findById.mockResolvedValue(mockAssignment);
      mockSubmissionRepository.update.mockResolvedValue({
        ...mockSubmission,
        status: SubmissionStatus.GRADED,
        score: 80,
      });

      const result = await service.grade(mockStaffRequester as any, 's-1', {
        score: 80,
        feedback: 'Good',
      });

      expect(result.status).toBe(SubmissionStatus.GRADED);
      expect(result.score).toBe(80);
      expect(natsClient.emit).toHaveBeenCalledWith(
        'submission.graded',
        expect.any(Object),
      );
    });

    it('should throw ForbiddenException if requester not instructor', async () => {
      mockSubmissionRepository.findById.mockResolvedValue(mockSubmission);
      mockAssignmentRepository.findById.mockResolvedValue(mockAssignment);
      await expect(
        service.grade(mockRequester as any, 's-1', { score: 80 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
