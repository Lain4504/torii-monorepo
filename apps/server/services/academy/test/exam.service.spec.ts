import { Test, TestingModule } from '@nestjs/testing';
import { ExamService } from '../src/modules/assessment/exam/exam.service';
import { PrismaService } from '@server/shared';

describe('ExamService', () => {
  let service: ExamService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = {
      academyExam: {
        create: jest.fn().mockResolvedValue({ id: 'ex1' }),
        update: jest.fn().mockResolvedValue({ id: 'ex1' }),
        findMany: jest.fn().mockResolvedValue([]),
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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ExamService>(ExamService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createExam', () => {
    it('should create exam with sections', async () => {
      const dto = {
        title: 'Final Exam',
        examType: 'MOCK_EXAM',
        sections: [{ title: 'Listening', orderIndex: 0, sectionType: 'LISTENING' }]
      };
      await service.createExam(dto as any);
      expect(prisma.academyExam.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sections: expect.objectContaining({ create: expect.any(Array) })
          })
        })
      );
    });
  });

  describe('addQuestionsToSection', () => {
    it('should increment order index correctly', async () => {
      prisma.academyExamSection.findUnique.mockResolvedValue({ id: 'sec1', examId: 'ex1' });
      prisma.academyExamQuestion.findFirst.mockResolvedValue({ orderIndex: 5 });

      await service.addQuestionsToSection({ sectionId: 'sec1', questionIds: ['q1', 'q2'], points: 1 });
      expect(prisma.academyExamQuestion.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({ questionId: 'q1', orderIndex: 6 }),
          expect.objectContaining({ questionId: 'q2', orderIndex: 7 }),
        ]
      });
    });
  });
});
