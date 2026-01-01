import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { LessonService } from '../../modules/lesson/lesson.service';
import {
  type LessonCreateDTO,
  type LessonUpdateDTO,
  type LessonQueryDTO,
} from '@workspace/schemas';
import { FirebaseAuthGuard, RolesGuard, Roles } from '@server/shared';
import { UserRole } from '@workspace/schemas';

@Controller('lessons')
@UseGuards(FirebaseAuthGuard)
export class LessonController {
  private readonly logger = new Logger(LessonController.name);

  constructor(private readonly lessonService: LessonService) {
  }

  @Get()
  async findAll(@Query() query: LessonQueryDTO) {
    return await this.lessonService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.lessonService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LECTURER)
  async create(@Body() input: LessonCreateDTO) {
    this.logger.log('Received lesson.create request');
    return await this.lessonService.create(input);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LECTURER)
  async update(@Param('id') id: string, @Body() input: LessonUpdateDTO) {
    return await this.lessonService.update(id, input);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LECTURER)
  async delete(@Param('id') id: string) {
    return await this.lessonService.delete(id);
  }

  @Post(':id/restore')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async restore(@Param('id') id: string) {
    return await this.lessonService.restore(id);
  }
}
