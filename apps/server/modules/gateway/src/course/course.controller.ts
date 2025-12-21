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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import {
  Course,
  CreateCourseInput,
  UpdateCourseInput,
  CourseListResponse,
} from './course.schema';

@ApiTags('admin/courses')
@ApiBearerAuth()
@Controller('api/v1/admin/courses')
export class CourseController {
  constructor(
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all courses with pagination and filters' })
  @ApiOkResponse({ type: CourseListResponse })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'jlptLevel', required: false, enum: ['N5', 'N4', 'N3', 'N2', 'N1'] })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published', 'archived'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('jlptLevel') jlptLevel?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
  ): Promise<CourseListResponse> {
    const payload = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      ...(jlptLevel && { jlptLevel }),
      ...(status && { status }),
      ...(search && { search }),
      ...(featured !== undefined && { 
        featured: featured === 'true' 
      }),
    };

    const response = await lastValueFrom<CourseListResponse>(
      this.natsClient.send({ cmd: 'course.findAll' }, payload),
    );

    // Map courses to ensure proper formatting
    return {
      ...response,
      data: response.data.map(toCourse),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by id' })
  @ApiOkResponse({ type: Course })
  async findOne(@Param('id') id: string): Promise<Course | null> {
    const course = await lastValueFrom<Course | null>(
      this.natsClient.send<Course | null>({ cmd: 'course.findOne' }, id),
    );
    return course ? toCourse(course) : null;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiCreatedResponse({ type: Course })
  async create(@Body() input: CreateCourseInput): Promise<Course> {
    try {
      console.log('Gateway: Sending course.create request with input:', JSON.stringify(input, null, 2));
      const course = await lastValueFrom<Course>(
        this.natsClient.send<Course>({ cmd: 'course.create' }, input),
      );
      console.log('Gateway: Received response from course-service');
      return toCourse(course);
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
  @ApiOperation({ summary: 'Update a course' })
  @ApiOkResponse({ type: Course })
  async update(
    @Param('id') id: string,
    @Body() input: UpdateCourseInput,
  ): Promise<Course> {
    try {
      console.log(`Gateway: Updating course ${id} with input:`, JSON.stringify(input, null, 2));
      const course = await lastValueFrom<Course>(
        this.natsClient.send<Course>(
          { cmd: 'course.update' },
          { id, input },
        ),
      );
      console.log('Gateway: Course updated successfully');
      return toCourse(course);
    } catch (error: any) {
      console.error('Gateway: Error updating course:', error);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course (soft delete)' })
  @ApiOkResponse({ type: Boolean })
  delete(@Param('id') id: string): Promise<boolean> {
    return lastValueFrom<boolean>(
      this.natsClient.send<boolean>({ cmd: 'course.delete' }, id),
    );
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted course' })
  @ApiOkResponse({ type: Course })
  async restore(@Param('id') id: string): Promise<Course> {
    try {
      console.log(`Gateway: Restoring course ${id}`);
      const course = await lastValueFrom<Course>(
        this.natsClient.send<Course>({ cmd: 'course.restore' }, id),
      );
      console.log('Gateway: Course restored successfully');
      return toCourse(course);
    } catch (error: any) {
      console.error('Gateway: Error restoring course:', error);
      throw error;
    }
  }
}

const toCourse = (data: any): Course => ({
  ...data,
  createdAt: data?.createdAt ? new Date(data.createdAt) : data?.createdAt,
  updatedAt: data?.updatedAt ? new Date(data.updatedAt) : data?.updatedAt,
  approvedAt: data?.approvedAt ? new Date(data.approvedAt) : data?.approvedAt,
  deletedAt: data?.deletedAt ? new Date(data.deletedAt) : data?.deletedAt,
  price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
  discountPrice:
    typeof data.discountPrice === 'string'
      ? parseFloat(data.discountPrice)
      : data.discountPrice,
  averageRating:
    typeof data.averageRating === 'string'
      ? parseFloat(data.averageRating)
      : data.averageRating,
});
