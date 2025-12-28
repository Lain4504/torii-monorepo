import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  type CourseCreateDTO,
  type CourseUpdateDTO,
  type CourseQueryDTO,
  type CourseResponseDTO,
  type PaginatedResponse,
} from '@workspace/schemas';
import { CourseService } from './course.service';

@Controller()
export class CourseController {
  private readonly logger = new Logger(CourseController.name);

  constructor(private readonly courseService: CourseService) { }

  @MessagePattern({ cmd: 'course.findAll' })
  async findAll(@Payload() query: CourseQueryDTO): Promise<PaginatedResponse<CourseResponseDTO>> {
    return await this.courseService.findAll(query);
  }

  @MessagePattern({ cmd: 'course.findOne' })
  async findOne(@Payload() id: string): Promise<CourseResponseDTO | null> {
    return await this.courseService.findOne(id);
  }

  @MessagePattern({ cmd: 'course.create' })
  async create(@Payload() input: CourseCreateDTO): Promise<CourseResponseDTO> {
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
  async update(@Payload() data: { id: string; input: CourseUpdateDTO }): Promise<CourseResponseDTO> {
    try {
      this.logger.log(`Updating course: ${data.id}`);
      this.logger.debug('Update input data:', JSON.stringify(data.input, null, 2));
      const result = await this.courseService.update(data.id, data.input);
      this.logger.log('Course updated successfully');
      return result;
    } catch (error: any) {
      this.logger.error('Error in course.update:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'course.delete' })
  delete(@Payload() id: string): Promise<boolean> {
    return this.courseService.delete(id);
  }

  @MessagePattern({ cmd: 'course.restore' })
  async restore(@Payload() id: string): Promise<CourseResponseDTO> {
    try {
      this.logger.log(`Restoring course: ${id}`);
      const result = await this.courseService.restore(id);
      this.logger.log('Course restored successfully');
      return result;
    } catch (error: any) {
      this.logger.error('Error in course.restore:', error);
      throw error;
    }
  }
}
