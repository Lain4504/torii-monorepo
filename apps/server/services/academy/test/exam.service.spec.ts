import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExamService } from '../src/modules/assessment/exam/exam.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';

describe('ExamService', () => {
  let service: ExamService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      academyExam: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      academyExamSection: {
        findUnique: jest.fn(),
      },
      academyExamQuestion: {
        findFirst: jest.fn(),
        createMany: jest.fn(),
        delete: jest.fn(),
      },
      academyCourseProfileAssessment: {
        findMany: jest.fn(),
      },
      academyExamAttempt: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ExamService>(ExamService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createExam', () => {
    it('should create exam with sections', async () => {
      const dto = {
        title: 'New Exam',
        sections: [
          { title: 'Sec 1', orderIndex: 0, sectionType: 'READING' },
        ],
      } as any;

      mockPrisma.academyExam.create.mockResolvedValue({ id: 'e1', title: 'New Exam' });

      const result = await service.createExam(dto);

      expect(mockPrisma.academyExam.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'New Exam',
          sections: {
            create: [
              expect.objectContaining({ title: 'Sec 1' }),
            ],
          },
        }),
        include: { sections: true },
      });
      expect(result.id).toBe('e1');
    });
  });

  describe('getExamDetail', () => {
    it('should throw NotFound if exam missing', async () => {
      mockPrisma.academyExam.findUnique.mockResolvedValue(null);
      await expect(service.getExamDetail('missing')).rejects.toThrow(NotFoundException);
    });

    it('should return nested exam details', async () => {
      const mockExam = { id: 'e1', sections: [] };
      mockPrisma.academyExam.findUnique.mockResolvedValue(mockExam);

      const result = await service.getExamDetail('e1');
      expect(result).toBe(mockExam);
    });
  });

  describe('addQuestionsToSection', () => {
    it('should throw if section missing', async () => {
      mockPrisma.academyExamSection.findUnique.mockResolvedValue(null);
      await expect(
        service.addQuestionsToSection({ sectionId: 's1', questionIds: ['q1'], points: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should calculate next orderIndex correctly', async () => {
      mockPrisma.academyExamSection.findUnique.mockResolvedValue({ id: 's1', examId: 'e1' });
      mockPrisma.academyExamQuestion.findFirst.mockResolvedValue({ orderIndex: 5 });
      mockPrisma.academyExamQuestion.createMany.mockResolvedValue({ count: 1 });

      await service.addQuestionsToSection({ sectionId: 's1', questionIds: ['q1'], points: 1 });

      expect(mockPrisma.academyExamQuestion.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({ orderIndex: 6 }),
        ],
      });
    });

    it('should start with orderIndex 0 if no previous questions', async () => {
        mockPrisma.academyExamSection.findUnique.mockResolvedValue({ id: 's1', examId: 'e1' });
        mockPrisma.academyExamQuestion.findFirst.mockResolvedValue(null);
        mockPrisma.academyExamQuestion.createMany.mockResolvedValue({ count: 1 });
  
        await service.addQuestionsToSection({ sectionId: 's1', questionIds: ['q1'], points: 1 });
  
        expect(mockPrisma.academyExamQuestion.createMany).toHaveBeenCalledWith({
          data: [
            expect.objectContaining({ orderIndex: 0 }),
          ],
        });
      });
  });

  describe('deleteExam', () => {
    it('should throw BadRequest if exam used in assessments', async () => {
      mockPrisma.academyCourseProfileAssessment.findMany.mockResolvedValue([
        {
          courseProfile: {
            cohorts: [{ liveClasses: [{ name: 'Class A' }] }],
          },
        },
      ]);
      mockPrisma.academyExamAttempt.findMany.mockResolvedValue([]);

      await expect(service.deleteExam('e1')).rejects.toThrow('Class A');
    });

    it('should throw BadRequest if exam has attempts from LiveClass', async () => {
        mockPrisma.academyCourseProfileAssessment.findMany.mockResolvedValue([]);
        mockPrisma.academyExamAttempt.findMany.mockResolvedValue([
            { class: { name: 'Class B' } }
        ]);
  
        await expect(service.deleteExam('e1')).rejects.toThrow('Class B');
      });

    it('should throw BadRequest if exam has any general attempts', async () => {
        mockPrisma.academyCourseProfileAssessment.findMany.mockResolvedValue([]);
        mockPrisma.academyExamAttempt.findMany.mockResolvedValue([]);
        mockPrisma.academyExamAttempt.count.mockResolvedValue(10);
  
        await expect(service.deleteExam('e1')).rejects.toThrow('10 lượt làm bài');
      });

    it('should delete if no usage/attempts found', async () => {
      mockPrisma.academyCourseProfileAssessment.findMany.mockResolvedValue([]);
      mockPrisma.academyExamAttempt.findMany.mockResolvedValue([]);
      mockPrisma.academyExamAttempt.count.mockResolvedValue(0);
      mockPrisma.academyExam.delete.mockResolvedValue({ id: 'e1' });

      const result = await service.deleteExam('e1');

      expect(mockPrisma.academyExam.delete).toHaveBeenCalledWith({ where: { id: 'e1' } });
      expect(result.id).toBe('e1');
    });
  });
});
