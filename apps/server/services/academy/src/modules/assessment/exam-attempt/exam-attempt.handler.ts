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
  findById(@Payload() data: { id: string }) {
    return this.attempts.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.examAttempt.start' })
  start(@Payload() input: ExamAttemptStartDto) {
    return this.attempts.start(input);
  }

  @MessagePattern({ cmd: 'academy.examAttempt.saveAnswers' })
  saveAnswers(@Payload() input: ExamAttemptSaveAnswersDto) {
    return this.attempts.saveAnswers(input);
  }

  @MessagePattern({ cmd: 'academy.examAttempt.submit' })
  submit(@Payload() input: ExamAttemptSubmitDto) {
    return this.attempts.submit(input);
  }
}

