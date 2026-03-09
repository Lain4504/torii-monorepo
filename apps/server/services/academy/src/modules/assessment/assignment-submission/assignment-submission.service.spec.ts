import { BadRequestException } from '@nestjs/common';
import { AssignmentSubmissionService } from './assignment-submission.service';

describe('AssignmentSubmissionService', () => {
  it('rejects submission for VOD class', async () => {
    const prisma = {
      class: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'class-vod',
          mode: 'VOD',
        }),
      },
    } as any;

    const service = new AssignmentSubmissionService(prisma, {
      log: jest.fn(),
    } as any);

    await expect(
      service.create({
        classId: 'class-vod',
        classAssessmentId: 'assessment-1',
        assignmentTemplateId: 'template-1',
        userId: 'user-1',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
