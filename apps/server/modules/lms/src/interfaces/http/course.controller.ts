import { Controller, Get, Post, Put, Delete, Body, Param, Query, Logger, UseGuards, Patch } from '@nestjs/common';
import { CourseService } from '../../modules/course/course.service';
import {
  type CourseCreateDTO,
  type CourseUpdateDTO,
  type CourseQueryDTO,
  type CourseResponseDTO,
  type PaginatedResponse,
} from '@workspace/schemas';
import { FirebaseAuthGuard, RolesGuard, Roles } from '@server/shared';
import { UserRole } from '@workspace/schemas';

@Controller('courses')
@UseGuards(FirebaseAuthGuard)
export class CourseController {
  private readonly logger = new Logger(CourseController.name);

  constructor(private readonly courseService: CourseService) { }

  @Get()
  async findAll(@Query() query: CourseQueryDTO): Promise<PaginatedResponse<CourseResponseDTO>> {
    return await this.courseService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CourseResponseDTO | null> {
    return await this.courseService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LECTURER)
  async create(@Body() input: CourseCreateDTO): Promise<CourseResponseDTO> {
    try {
      this.logger.log('Received course.create request');
      return await this.courseService.create(input);
    } catch (error: any) {
      this.logger.error('Error in course.create:', error);
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async update(
    @Param('id') id: string,
    @Body() input: CourseUpdateDTO
  ): Promise<CourseResponseDTO> {
    try {
      this.logger.log(`Updating course: ${id}`);
      return await this.courseService.update(id, input);
    } catch (error: any) {
      this.logger.error('Error in course.update:', error);
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string): Promise<boolean> {
    return this.courseService.delete(id);
  }

  @Post(':id/restore')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async restore(@Param('id') id: string): Promise<CourseResponseDTO> {
    try {
      this.logger.log(`Restoring course: ${id}`);
      return await this.courseService.restore(id);
    } catch (error: any) {
      this.logger.error('Error in course.restore:', error);
      throw error;
    }
  }
}
