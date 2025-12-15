import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import { Course, CreateCourseInput, UpdateCourseInput } from './course.schema';

@ApiTags('courses')
@ApiBearerAuth()
@Controller('courses')
export class CourseController {
  constructor(
    @Inject('COURSE_SERVICE')
    private readonly courseClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiOkResponse({ type: [Course] })
  findAll(): Promise<Course[]> {
    return lastValueFrom(
      this.courseClient.send<Course[]>({ cmd: 'course.findAll' }, {}),
    ).then((courses) => courses.map(toCourse));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by id' })
  @ApiOkResponse({ type: Course })
  async findOne(@Param('id') id: string): Promise<Course | null> {
    const course = await lastValueFrom(
      this.courseClient.send<Course | null>(
        { cmd: 'course.findOne' },
        parseInt(id, 10),
      ),
    );
    return course ? toCourse(course) : null;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiCreatedResponse({ type: Course })
  async create(@Body() input: CreateCourseInput): Promise<Course> {
    const course = await lastValueFrom(
      this.courseClient.send<Course>({ cmd: 'course.create' }, input),
    );
    return toCourse(course);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course' })
  @ApiOkResponse({ type: Course })
  async update(
    @Param('id') id: string,
    @Body() input: UpdateCourseInput,
  ): Promise<Course> {
    const course = await lastValueFrom(
      this.courseClient.send<Course>(
        { cmd: 'course.update' },
        { id: parseInt(id, 10), input },
      ),
    );
    return toCourse(course);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course' })
  @ApiOkResponse({ type: Boolean })
  delete(@Param('id') id: string): Promise<boolean> {
    return lastValueFrom(
      this.courseClient.send<boolean>(
        { cmd: 'course.delete' },
        parseInt(id, 10),
      ),
    );
  }
}

const toCourse = (data: any): Course => ({
  ...data,
  createdAt: data?.createdAt ? new Date(data.createdAt) : data?.createdAt,
  updatedAt: data?.updatedAt ? new Date(data.updatedAt) : data?.updatedAt,
});
