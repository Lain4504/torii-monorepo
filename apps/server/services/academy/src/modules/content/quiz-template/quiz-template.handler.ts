import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QuizTemplateService } from './quiz-template.service';
import {
  QuizTemplateCreateDto,
  QuizTemplateQueryDto,
  QuizTemplateUpdateDto,
} from './dto/quiz-template.dto';

@Controller()
export class QuizTemplateHandler {
  constructor(private readonly templates: QuizTemplateService) { }

  @MessagePattern({ cmd: 'academy.quizTemplate.findAll' })
  findAll(@Payload() query: QuizTemplateQueryDto) {
    return this.templates.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.quizTemplate.findById' })
  findById(@Payload() data: { id: string }) {
    return this.templates.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.quizTemplate.create' })
  create(@Payload() input: QuizTemplateCreateDto) {
    return this.templates.create(input);
  }

  @MessagePattern({ cmd: 'academy.quizTemplate.update' })
  update(@Payload() data: { id: string; input: QuizTemplateUpdateDto }) {
    return this.templates.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'academy.quizTemplate.getUsage' })
  getUsage(@Payload() data: { id: string }) {
    return this.templates.getUsage(data.id);
  }

  @MessagePattern({ cmd: 'academy.quizTemplate.delete' })
  delete(@Payload() data: { id: string }) {
    return this.templates.delete(data.id);
  }
}

