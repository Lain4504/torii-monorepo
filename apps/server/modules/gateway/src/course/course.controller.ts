import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '@server/shared/pipes/zod-validation.pipe';
import {
  type CourseCreateDTO,
  type CourseUpdateDTO,
  type CourseQueryDTO,
  type CourseResponseDTO,
  type PaginatedResponse,
  courseCreateDTOSchema,
  courseUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/admin/courses')
export class CourseController {
  constructor(
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
  ) { }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('jlptLevel') jlptLevel?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
  ): Promise<PaginatedResponse<CourseResponseDTO>> {
    const payload: CourseQueryDTO = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      ...(jlptLevel && { jlptLevel: jlptLevel as any }),
      ...(status && { status: status as any }),
      ...(search && { search }),
      ...(featured !== undefined && {
        featured: featured === 'true'
      }),
    };

    const response = await lastValueFrom<PaginatedResponse<CourseResponseDTO>>(
      this.natsClient.send({ cmd: 'course.findAll' }, payload),
    );

    return response;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CourseResponseDTO | null> {
    const course = await lastValueFrom<CourseResponseDTO | null>(
      this.natsClient.send<CourseResponseDTO | null>({ cmd: 'course.findOne' }, id),
    );
    return course;
  }

  @Post()
  @UsePipes(new ZodValidationPipe(courseCreateDTOSchema))
  async create(@Body() input: CourseCreateDTO): Promise<CourseResponseDTO> {
    try {
      const course = await lastValueFrom<CourseResponseDTO>(
        this.natsClient.send<CourseResponseDTO>({ cmd: 'course.create' }, input),
      );
      return course;
    } catch (error: any) {
      console.error('Gateway: Error in course.create:', error);
      throw error;
    }
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(courseUpdateDTOSchema))
  async update(
    @Param('id') id: string,
    @Body() input: CourseUpdateDTO,
  ): Promise<CourseResponseDTO> {
    try {
      const course = await lastValueFrom<CourseResponseDTO>(
        this.natsClient.send<CourseResponseDTO>(
          { cmd: 'course.update' },
          { id, input },
        ),
      );
      return course;
    } catch (error: any) {
      console.error('Gateway: Error updating course:', error);
      throw error;
    }
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<boolean> {
    return lastValueFrom<boolean>(
      this.natsClient.send<boolean>({ cmd: 'course.delete' }, id),
    );
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string): Promise<CourseResponseDTO> {
    try {
      const course = await lastValueFrom<CourseResponseDTO>(
        this.natsClient.send<CourseResponseDTO>({ cmd: 'course.restore' }, id),
      );
      return course;
    } catch (error: any) {
      console.error('Gateway: Error restoring course:', error);
      throw error;
    }
  }
}
