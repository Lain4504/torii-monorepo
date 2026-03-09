import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ExamAttemptService } from './exam-attempt.service';
import {
  ExamAttemptQueryDto,
  ExamAttemptSaveAnswersDto,
  ExamAttemptStartDto,
  ExamAttemptSubmitDto,
} from './dto/exam-attempt.dto';

@Controller()
export class ExamAttemptHandler {
  constructor(private readonly attempts: ExamAttemptService) {}

  @MessagePattern({ cmd: 'academy.examAttempt.findAll' })
  findAll(@Payload() query: ExamAttemptQueryDto) {
    return this.attempts.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.examAttempt.findById' })
  findById(@Payload() data: { id: string; requesterId?: string; isExamManager?: boolean }) {
    return this.attempts.findById(data.id, data.requesterId, data.isExamManager);
  }

  @MessagePattern({ cmd: 'academy.examAttempt.start' })
  start(@Payload() input: ExamAttemptStartDto & { requesterId?: string; isExamManager?: boolean }) {
    return this.attempts.start(input, input.requesterId, input.isExamManager);
  }

  @MessagePattern({ cmd: 'academy.examAttempt.saveAnswers' })
  saveAnswers(@Payload() input: ExamAttemptSaveAnswersDto & { requesterId?: string; isExamManager?: boolean }) {
    return this.attempts.saveAnswers(input, input.requesterId, input.isExamManager);
  }

  @MessagePattern({ cmd: 'academy.examAttempt.submit' })
  submit(@Payload() input: ExamAttemptSubmitDto & { requesterId?: string; isExamManager?: boolean }) {
    return this.attempts.submit(input, input.requesterId, input.isExamManager);
  }
}

