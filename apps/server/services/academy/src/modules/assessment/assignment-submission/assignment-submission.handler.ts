import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AssignmentSubmissionService } from './assignment-submission.service';
import {
  AssignmentSubmissionCreateDto,
  AssignmentSubmissionQueryDto,
  AssignmentSubmissionUpdateDto,
} from './dto/assignment-submission.dto';

@Controller()
export class AssignmentSubmissionHandler {
  constructor(private readonly submissions: AssignmentSubmissionService) {}

  @MessagePattern({ cmd: 'academy.assignmentSubmission.findAll' })
  findAll(@Payload() query: AssignmentSubmissionQueryDto) {
    return this.submissions.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.assignmentSubmission.findById' })
  findById(@Payload() data: { id: string }) {
    return this.submissions.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.assignmentSubmission.create' })
  create(@Payload() input: AssignmentSubmissionCreateDto) {
    return this.submissions.create(input);
  }

  @MessagePattern({ cmd: 'academy.assignmentSubmission.update' })
  update(@Payload() data: { id: string; input: AssignmentSubmissionUpdateDto }) {
    return this.submissions.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'academy.assignmentSubmission.delete' })
  delete(@Payload() data: { id: string }) {
    return this.submissions.delete(data.id);
  }
}

