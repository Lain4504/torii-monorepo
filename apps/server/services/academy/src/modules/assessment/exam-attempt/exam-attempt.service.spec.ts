import { BadRequestException } from '@nestjs/common';
import { ExamAttemptService } from './exam-attempt.service';

describe('ExamAttemptService', () => {
  it('rejects start when classAssessment does not belong to class', async () => {
    const prisma = {
      exam: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'exam-1',
          sections: [{ id: 'sec-1', orderIndex: 1 }],
        }),
      },
      class: {
        findUnique: jest.fn().mockResolvedValue({ id: 'class-1' }),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'user-1' }),
      },
      classAssessment: {
        findUnique: jest.fn().mockResolvedValue({
          classId: 'class-2',
          kind: 'QUIZ',
          maxAttemptsOverride: 3,
        }),
      },
      enrollment: {
        findFirst: jest.fn().mockResolvedValue({ id: 'enroll-1' }),
      },
    } as any;

    const service = new ExamAttemptService(prisma, { log: jest.fn() } as any, {
      trackActivity: jest.fn(),
    } as any);

    await expect(
      service.start({
        examId: 'exam-1',
        classId: 'class-1',
        userId: 'user-1',
        classAssessmentId: 'assessment-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('persists per-question detail on submit', async () => {
    const tx = {
      examAttemptDetail: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      examAttempt: {
        update: jest.fn().mockResolvedValue({ id: 'attempt-1', isPassed: true, percentage: 100 }),
      },
    };

    const prisma = {
      examAttempt: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'attempt-1',
          status: 'IN_PROGRESS',
          classId: 'class-1',
          userId: 'user-1',
          classAssessmentId: 'assessment-1',
          draftAnswers: { 'question-1': 'A' },
          exam: {
            id: 'exam-1',
            settings: {},
            examQuestions: [
              {
                id: 'eq-1',
                points: 1,
                question: {
                  id: 'question-1',
                  questionType: 'SINGLE_CHOICE',
                  correctAnswer: 'A',
                },
              },
            ],
          },
          classAssessment: {
            id: 'assessment-1',
            classId: 'class-1',
            settings: {},
          },
        }),
      },
      enrollment: {
        findFirst: jest.fn().mockResolvedValue({ id: 'enroll-1' }),
      },
      $transaction: jest.fn().mockImplementation(async (cb: any) => cb(tx)),
    } as any;

    const service = new ExamAttemptService(prisma, { log: jest.fn() } as any, {
      trackActivity: jest.fn().mockResolvedValue(undefined),
    } as any);

    await service.submit({ attemptId: 'attempt-1' });

    expect(tx.examAttemptDetail.deleteMany).toHaveBeenCalledWith({
      where: { attemptId: 'attempt-1' },
    });
    expect(tx.examAttemptDetail.createMany).toHaveBeenCalled();
  });
});
