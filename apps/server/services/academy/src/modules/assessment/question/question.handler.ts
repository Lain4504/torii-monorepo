import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QuestionService } from './question.service';
import { QuestionCreateDto, QuestionQueryDto, QuestionUpdateDto } from './dto/question.dto';

@Controller()
export class QuestionHandler {
  constructor(private readonly questions: QuestionService) {}

  @MessagePattern({ cmd: 'academy.question.findAll' })
  findAll(@Payload() query: QuestionQueryDto) {
    return this.questions.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.question.findById' })
  findById(@Payload() data: { id: string }) {
    return this.questions.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.question.create' })
  create(@Payload() input: QuestionCreateDto) {
    return this.questions.create(input);
  }

  @MessagePattern({ cmd: 'academy.question.update' })
  update(@Payload() data: { id: string; input: QuestionUpdateDto }) {
    return this.questions.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'academy.question.delete' })
  delete(@Payload() data: { id: string }) {
    return this.questions.delete(data.id);
  }
}

