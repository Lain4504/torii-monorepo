import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CourseEditionService } from './course-edition.service';
import {
  CourseEditionCreateDto,
  CourseEditionQueryDto,
  CourseEditionUpdateDto,
} from './dto/course-edition.dto';

@Controller()
export class CourseEditionHandler {
  constructor(private readonly editions: CourseEditionService) {}

  @MessagePattern({ cmd: 'academy.courseEdition.findAll' })
  findAll(@Payload() query: CourseEditionQueryDto) {
    return this.editions.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.findById' })
  findById(@Payload() data: { id: string }) {
    return this.editions.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.create' })
  create(@Payload() input: CourseEditionCreateDto) {
    return this.editions.create(input);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.update' })
  update(@Payload() data: { id: string; input: CourseEditionUpdateDto }) {
    return this.editions.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.setCurrent' })
  setCurrent(@Payload() data: { id: string }) {
    return this.editions.setCurrent(data.id);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.delete' })
  delete(@Payload() data: { id: string }) {
    return this.editions.delete(data.id);
  }
}

