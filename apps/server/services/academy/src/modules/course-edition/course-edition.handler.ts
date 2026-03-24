import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CourseEditionService } from './course-edition.service';
import {
  AcademyCourseEditionCreateDTO,
  AcademyCourseEditionQueryDTO,
  AcademyCourseEditionUpdateDTO,
} from '@workspace/schemas';

@Controller()
export class CourseEditionHandler {
  constructor(private readonly editions: CourseEditionService) {}

  @MessagePattern({ cmd: 'academy.courseEdition.findAll' })
  findAll(@Payload() query: AcademyCourseEditionQueryDTO) {
    return this.editions.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.findById' })
  findById(@Payload() data: { id: string }) {
    return this.editions.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.create' })
  create(
    @Payload() data: AcademyCourseEditionCreateDTO & { requesterId?: string },
  ) {
    const { requesterId, ...input } = data;
    return this.editions.create(input, requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.update' })
  update(
    @Payload()
    data: {
      id: string;
      input: AcademyCourseEditionUpdateDTO;
      requesterId?: string;
    },
  ) {
    return this.editions.update(data.id, data.input, data.requesterId);
  }
}
