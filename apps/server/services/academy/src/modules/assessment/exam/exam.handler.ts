import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ExamService } from './exam.service';
import { ExamCreateDto, ExamQueryDto, ExamUpdateDto } from './dto/exam.dto';

@Controller()
export class ExamHandler {
  constructor(private readonly exams: ExamService) { }

  @MessagePattern({ cmd: 'academy.exam.findAll' })
  findAll(@Payload() query: ExamQueryDto) {
    return this.exams.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.exam.findById' })
  findById(@Payload() data: { id: string }) {
    return this.exams.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.exam.create' })
  create(@Payload() data: ExamCreateDto & { requesterId?: string }) {
    const { requesterId, ...input } = data;
    return this.exams.create(input, requesterId);
  }

  @MessagePattern({ cmd: 'academy.exam.update' })
  update(@Payload() data: { id: string; input: ExamUpdateDto; requesterId?: string }) {
    return this.exams.update(data.id, data.input, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.exam.publish' })
  publish(@Payload() data: { id: string }) {
    return this.exams.publishExam(data.id);
  }

  @MessagePattern({ cmd: 'academy.exam.archive' })
  archive(@Payload() data: { id: string }) {
    return this.exams.archiveExam(data.id);
  }

  @MessagePattern({ cmd: 'academy.exam.delete' })
  delete(@Payload() data: { id: string; requesterId?: string }) {
    return this.exams.delete(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.exam.addQuestionsFromPool' })
  addQuestionsFromPool(
    @Payload() data: { examId: string; sectionId: string; poolId: string; count: number },
  ) {
    return this.exams.addQuestionsFromPool(data.examId, data.sectionId, data.poolId, data.count);
  }
}

