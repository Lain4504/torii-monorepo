import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  type LessonCreateDTO,
  type LessonUpdateDTO,
  type LessonQueryDTO,
  type LessonResponseDTO,
  type PaginatedResponse,
  lessonCreateDTOSchema,
  lessonUpdateDTOSchema,
} from '@workspace/schemas';
import { UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '@server/shared/pipes/zod-validation.pipe';

@Controller('api/admin/lessons')
export class LessonController {
  constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('moduleId') moduleId?: string,
    @Query('contentType') contentType?: string,
    @Query('search') search?: string,
  ): Promise<PaginatedResponse<LessonResponseDTO>> {
    const payload: LessonQueryDTO = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      ...(moduleId && { moduleId }),
      ...(contentType && { contentType: contentType as any }),
      ...(search && { search }),
    };

    return await lastValueFrom(this.natsClient.send<PaginatedResponse<LessonResponseDTO>>({ cmd: 'lesson.findAll' }, payload));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<LessonResponseDTO | null> {
    return await lastValueFrom(this.natsClient.send<LessonResponseDTO | null>({ cmd: 'lesson.findOne' }, id));
  }

  @Post()
  @UsePipes(new ZodValidationPipe(lessonCreateDTOSchema))
  async create(@Body() input: LessonCreateDTO): Promise<LessonResponseDTO> {
    try {
      return await lastValueFrom(this.natsClient.send<LessonResponseDTO>({ cmd: 'lesson.create' }, input));
    } catch (error: any) {
      console.error('Gateway: Error in lesson.create:', error);
      throw error;
    }
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(lessonUpdateDTOSchema))
  async update(@Param('id') id: string, @Body() input: LessonUpdateDTO): Promise<LessonResponseDTO> {
    try {
      return await lastValueFrom(this.natsClient.send<LessonResponseDTO>({ cmd: 'lesson.update' }, { id, input }));
    } catch (error: any) {
      console.error('Gateway: Error in lesson.update:', error);
      throw error;
    }
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<boolean> {
    try {
      return lastValueFrom(this.natsClient.send<boolean>({ cmd: 'lesson.delete' }, id));
    } catch (error: any) {
      console.error('Gateway: Error in lesson.delete:', error);
      throw error;
    }
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string): Promise<LessonResponseDTO> {
    try {
      return await lastValueFrom(this.natsClient.send<LessonResponseDTO>({ cmd: 'lesson.restore' }, id));
    } catch (error: any) {
      console.error('Gateway: Error in lesson.restore:', error);
      throw error;
    }
  }
}
