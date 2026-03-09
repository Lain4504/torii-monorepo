import { BadRequestException } from '@nestjs/common';
import { ClassAssessmentService } from './class-assessment.service';

describe('ClassAssessmentService', () => {
  it('rejects ASSIGNMENT creation for VOD class', async () => {
    const prisma = {
      class: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'class-vod',
          mode: 'VOD',
        }),
      },
      classAssessment: {
        create: jest.fn(),
      },
    } as any;

    const service = new ClassAssessmentService(prisma);

    await expect(
      service.create({
        classId: 'class-vod',
        kind: 'ASSIGNMENT',
        assignmentTemplateId: 'template-id',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('aggregates wrong-question analytics by question', async () => {
    const prisma = {
      classAssessment: {
        findUnique: jest.fn().mockResolvedValue({ id: 'assessment-1' }),
      },
      examAttempt: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'attempt-1', userId: 'u1', classAssessmentId: 'assessment-1' },
          { id: 'attempt-2', userId: 'u2', classAssessmentId: 'assessment-1' },
        ]),
      },
      examAttemptDetail: {
        findMany: jest.fn().mockResolvedValue([
          {
            attemptId: 'attempt-1',
            questionId: 'q1',
            isCorrect: false,
            question: { id: 'q1', content: 'Q1', questionType: 'SINGLE_CHOICE' },
          },
          {
            attemptId: 'attempt-2',
            questionId: 'q1',
            isCorrect: false,
            question: { id: 'q1', content: 'Q1', questionType: 'SINGLE_CHOICE' },
          },
          {
            attemptId: 'attempt-1',
            questionId: 'q2',
            isCorrect: true,
            question: { id: 'q2', content: 'Q2', questionType: 'SINGLE_CHOICE' },
          },
        ]),
      },
    } as any;

    const service = new ClassAssessmentService(prisma);
    const result = await service.findWrongQuestionAnalytics('assessment-1', {});

    expect(result.totalAttempts).toBe(2);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].questionId).toBe('q1');
    expect(result.questions[0].wrongCount).toBe(2);
    expect(result.questions[0].wrongRatePercent).toBe(100);
  });
});
