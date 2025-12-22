import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
  CourseResponseDto,
  UpdateCourseRequestDto,
  PaginatedResponseDto,
} from '@workspace/dtos';

@Controller('api/admin/courses')
export class CourseController {
  constructor(
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('jlptLevel') jlptLevel?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
  ): Promise<PaginatedResponseDto<CourseResponseDto>> {
    const payload: CourseQueryDto = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      ...(jlptLevel && { jlptLevel: jlptLevel as any }),
      ...(status && { status: status as any }),
      ...(search && { search }),
      ...(featured !== undefined && { 
        featured: featured === 'true' 
      }),
    };

    const response = await lastValueFrom<PaginatedResponseDto<CourseResponseDto>>(
      this.natsClient.send({ cmd: 'course.findAll' }, payload),
    );

    return response;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CourseResponseDto | null> {
    const course = await lastValueFrom<CourseResponseDto | null>(
      this.natsClient.send<CourseResponseDto | null>({ cmd: 'course.findOne' }, id),
    );
    return course;
  }

  @Post()
  async create(@Body() input: CreateCourseDto): Promise<CourseResponseDto> {
    try {
      const course = await lastValueFrom<CourseResponseDto>(
        this.natsClient.send<CourseResponseDto>({ cmd: 'course.create' }, input),
      );
      return course;
    } catch (error: any) {
      console.error('Gateway: Error in course.create:', error);
      console.error('Gateway: Error details:', {
        status: error?.status,
        message: error?.message,
        error: error?.error,
        code: error?.code,
        name: error?.name,
      });
      
      // If it's an RpcException, extract the message
      if (error?.error && typeof error.error === 'object') {
        const rpcError = error.error;
        if (rpcError.status && rpcError.message) {
          throw new HttpException(
            {
              success: false,
              message: rpcError.message,
              error: rpcError.message,
              data: null,
              statusCode: rpcError.status,
            },
            rpcError.status,
          );
        }
      }
      
      // If error has message directly (from RpcException)
      if (error?.message && error?.status) {
        throw new HttpException(
          {
            success: false,
            message: error.message,
            error: error.message,
            data: null,
            statusCode: error.status,
          },
          error.status,
        );
      }
      
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    try {
      const course = await lastValueFrom<CourseResponseDto>(
        this.natsClient.send<CourseResponseDto>(
          { cmd: 'course.update' },
          { id, input } as UpdateCourseRequestDto,
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
  async restore(@Param('id') id: string): Promise<CourseResponseDto> {
    try {
      const course = await lastValueFrom<CourseResponseDto>(
        this.natsClient.send<CourseResponseDto>({ cmd: 'course.restore' }, id),
      );
      return course;
    } catch (error: any) {
      console.error('Gateway: Error restoring course:', error);
      throw error;
    }
  }
}
