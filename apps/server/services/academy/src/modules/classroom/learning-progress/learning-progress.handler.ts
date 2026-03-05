import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LearningProgressService } from './learning-progress.service';
import {
  LearningProgressQueryDto,
  LearningProgressUpsertDto,
} from './dto/learning-progress.dto';

@Controller()
export class LearningProgressHandler {
  constructor(private readonly progress: LearningProgressService) {}

  @MessagePattern({ cmd: 'academy.learningProgress.findAll' })
  findAll(@Payload() query: LearningProgressQueryDto) {
    return this.progress.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.learningProgress.upsert' })
  upsert(@Payload() input: LearningProgressUpsertDto) {
    return this.progress.upsert(input);
  }
}

