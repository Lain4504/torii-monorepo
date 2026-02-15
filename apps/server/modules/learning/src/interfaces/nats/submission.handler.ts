import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SubmissionService } from '@server/learning/modules/submission/submission.service';

@Controller()
export class SubmissionHandler {
  constructor(
    private readonly submissionService: SubmissionService,
  ) {}

  @MessagePattern({ cmd: 'learning.submission.saveDraft' })
  async saveDraft(@Payload() data: any) {
    const { assignmentId, requester, ...dto } = data;
    return this.submissionService.saveDraft(requester, assignmentId, dto);
  }

  @MessagePattern({ cmd: 'learning.submission.submit' })
  async submit(@Payload() data: any) {
    const { assignmentId, requester, ...dto } = data;
    return this.submissionService.submit(requester, assignmentId, dto);
  }

  @MessagePattern({ cmd: 'learning.submission.grade' })
  async grade(@Payload() data: any) {
    const { id, requester, ...dto } = data;
    return this.submissionService.grade(requester, id, dto);
  }

  @MessagePattern({ cmd: 'learning.submission.return' })
  async returnSubmission(@Payload() data: any) {
    const { id, requester, ...dto } = data;
    return this.submissionService.returnSubmission(requester, id, dto);
  }

  @MessagePattern({ cmd: 'learning.submission.getMySubmission' })
  async getMySubmission(@Payload() data: any) {
    const { assignmentId, userId } = data;
    return this.submissionService.getMySubmission(userId, assignmentId);
  }

  @MessagePattern({ cmd: 'learning.submission.findAll' })
  async findAll(@Payload() data: any) {
    const { assignmentId } = data;
    return this.submissionService.getSubmissions(assignmentId);
  }
}

