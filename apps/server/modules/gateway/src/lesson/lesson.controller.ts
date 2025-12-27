import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateLessonDto, UpdateLessonDto, LessonQueryDto, LessonResponseDto, UpdateLessonRequestDto, PaginatedResponseDto } from '@workspace/dtos';

@Controller('api/admin/lessons')
export class LessonController {
  constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('moduleId') moduleId?: string,
    @Query('contentType') contentType?: string,
    @Query('search') search?: string,
  ): Promise<PaginatedResponseDto<LessonResponseDto>> {
    const payload: LessonQueryDto = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      ...(moduleId && { moduleId }),
      ...(contentType && { contentType: contentType as any }),
      ...(search && { search }),
    };

    const response = await lastValueFrom(this.natsClient.send({ cmd: 'lesson.findAll' }, payload));
    return response;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<LessonResponseDto | null> {
    return await lastValueFrom(this.natsClient.send({ cmd: 'lesson.findOne' }, id));
  }

  @Post()
  async create(@Body() input: CreateLessonDto): Promise<LessonResponseDto> {
    try {
      return await lastValueFrom(this.natsClient.send({ cmd: 'lesson.create' }, input));
    } catch (error: any) {
      console.error('Gateway: Error in lesson.create:', error);
      throw error;
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() input: UpdateLessonDto): Promise<LessonResponseDto> {
    try {
      return await lastValueFrom(this.natsClient.send({ cmd: 'lesson.update' }, { id, input } as UpdateLessonRequestDto));
    } catch (error: any) {
      console.error('Gateway: Error in lesson.update:', error);
      throw error;
    }
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<boolean> {
    try {
      return lastValueFrom(this.natsClient.send({ cmd: 'lesson.delete' }, id));
    } catch (error: any) {
      console.error('Gateway: Error in lesson.delete:', error);
      throw error;
    }
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string): Promise<LessonResponseDto> {
    try {
      return await lastValueFrom(this.natsClient.send({ cmd: 'lesson.restore' }, id));
    } catch (error: any) {
      console.error('Gateway: Error in lesson.restore:', error);
      throw error;
    }
  }
}
