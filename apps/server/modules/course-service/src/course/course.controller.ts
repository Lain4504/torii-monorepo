import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
  UpdateCourseStatusDto,
} from './course.dto';
import { CourseService } from './course.service';
import { PaginatedResponseDto } from '@workspace/dtos';
import { Course } from '@prisma/generated';

@Controller()
export class CourseController {
  private readonly logger = new Logger(CourseController.name);

  constructor(private readonly courseService: CourseService) {}

  @MessagePattern({ cmd: 'course.findAll' })
  findAll(@Payload() query: CourseQueryDto): Promise<PaginatedResponseDto<Course>> {
    return this.courseService.findAll(query);
  }

  @MessagePattern({ cmd: 'course.findOne' })
  findOne(@Payload() id: string): Promise<Course | null> {
    return this.courseService.findOne(id);
  }

  @MessagePattern({ cmd: 'course.create' })
  async create(@Payload() input: CreateCourseDto): Promise<Course> {
    try {
      this.logger.log('Received course.create request');
      this.logger.debug('Input data:', JSON.stringify(input, null, 2));
      const result = await this.courseService.create(input);
      this.logger.log('Course created successfully');
      return result;
    } catch (error: any) {
      this.logger.error('Error in course.create:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'course.update' })
  update(@Payload() data: { id: string; input: UpdateCourseDto }): Promise<Course> {
    return this.courseService.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'course.delete' })
  delete(@Payload() id: string): Promise<boolean> {
    return this.courseService.delete(id);
  }

  @MessagePattern({ cmd: 'course.updateStatus' })
  updateStatus(
    @Payload() data: { id: string; input: UpdateCourseStatusDto },
  ): Promise<Course> {
    return this.courseService.updateStatus(data.id, data.input);
  }
}
