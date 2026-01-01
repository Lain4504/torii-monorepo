import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { LessonService } from '../../modules/lesson/lesson.service';
import {
  type LessonCreateDTO,
  type LessonUpdateDTO,
  type LessonQueryDTO,
} from '@workspace/schemas';
import { GatewayAuthGuard } from '@server/shared';

@Controller('lessons')
@UseGuards(GatewayAuthGuard)
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
  async create(@Body() input: LessonCreateDTO) {
    this.logger.log('Received lesson.create request');
    return await this.lessonService.create(input);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() input: LessonUpdateDTO) {
    return await this.lessonService.update(id, input);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.lessonService.delete(id);
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string) {
    return await this.lessonService.restore(id);
  }
}
