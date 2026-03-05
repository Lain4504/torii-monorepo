import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LearningProgressService } from './learning-progress.service';
import {
  LearningProgressQueryDto, LearningProgressStatsDto,
  LearningProgressUpsertDto,
} from './dto/learning-progress.dto';

@Controller()
export class LearningProgressHandler {
  constructor(private readonly progress: LearningProgressService) {}

  @MessagePattern({ cmd: 'academy.learningProgress.findAll' })
  findAll(@Payload() query: LearningProgressQueryDto) {
    return this.progress.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.learningProgress.getStats' })
  getStats(@Payload() query: LearningProgressStatsDto) {
    return this.progress.getStats(query.userId);
  }

  @MessagePattern({ cmd: 'academy.learningProgress.getHistory' })
  getHistory(@Payload() query: LearningProgressStatsDto) {
    return this.progress.getHistory(query.userId);
  }

  @MessagePattern({ cmd: 'academy.learningProgress.upsert' })
  upsert(@Payload() input: LearningProgressUpsertDto) {
    return this.progress.upsert(input);
  }
}

