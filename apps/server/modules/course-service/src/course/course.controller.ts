import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CreateCourseDto, UpdateCourseDto } from './course.dto';
import { CourseService } from './course.service';

@Controller()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @MessagePattern({ cmd: 'course.findAll' })
  findAll() {
    return this.courseService.findAll();
  }

  @MessagePattern({ cmd: 'course.findOne' })
  findOne(@Payload() id: number) {
    return this.courseService.findOne(id);
  }

  @MessagePattern({ cmd: 'course.create' })
  create(@Payload() input: CreateCourseDto) {
    return this.courseService.create(input);
  }

  @MessagePattern({ cmd: 'course.update' })
  update(@Payload() data: { id: number; input: UpdateCourseDto }) {
    return this.courseService.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'course.delete' })
  delete(@Payload() id: number) {
    return this.courseService.delete(id);
  }
}
