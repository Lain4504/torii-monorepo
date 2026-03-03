import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SubmissionService } from '@server/learning/modules/submission/submission.service';
import { Requester, SubmitAssignmentDto, GradeSubmissionDto, ReturnSubmissionDto } from '@workspace/schemas';

@Controller()
export class SubmissionHandler {
  constructor(
    private readonly submissionService: SubmissionService,
  ) { }

  @MessagePattern({ cmd: 'learning.submission.saveDraft' })
  async saveDraft(@Payload() data: SubmitAssignmentDto & { assignmentId: string; requester: Requester }) {
    const { assignmentId, requester, ...dto } = data;
    return this.submissionService.saveDraft(requester, assignmentId, dto);
  }

  @MessagePattern({ cmd: 'learning.submission.submit' })
  async submit(@Payload() data: SubmitAssignmentDto & { assignmentId: string; requester: Requester }) {
    const { assignmentId, requester, ...dto } = data;
    return this.submissionService.submit(requester, assignmentId, dto);
  }

  @MessagePattern({ cmd: 'learning.submission.grade' })
  async grade(@Payload() data: GradeSubmissionDto & { id: string; requester: Requester }) {
    const { id, requester, ...dto } = data;
    return this.submissionService.grade(requester, id, dto);
  }

  @MessagePattern({ cmd: 'learning.submission.return' })
  async returnSubmission(@Payload() data: ReturnSubmissionDto & { id: string; requester: Requester }) {
    const { id, requester, ...dto } = data;
    return this.submissionService.returnSubmission(requester, id, dto);
  }

  @MessagePattern({ cmd: 'learning.submission.getMySubmission' })
  async getMySubmission(@Payload() data: { assignmentId: string; userId: string; courseRunId: string }) {
    const { assignmentId, userId, courseRunId } = data;
    return this.submissionService.getMySubmission(userId, assignmentId, courseRunId);
  }

  @MessagePattern({ cmd: 'learning.submission.findAll' })
  async findAll(@Payload() data: { assignmentId: string; courseRunId?: string }) {
    const { assignmentId, courseRunId } = data;
    return this.submissionService.getSubmissions(assignmentId, courseRunId);
  }
}

