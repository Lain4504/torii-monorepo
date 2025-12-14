import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

import { Course } from './course.entity';
import { CreateCourseInput, UpdateCourseInput } from './course.input';

const toCourse = (data: any): Course => ({
  ...data,
  createdAt: data?.createdAt ? new Date(data.createdAt) : data?.createdAt,
  updatedAt: data?.updatedAt ? new Date(data.updatedAt) : data?.updatedAt,
});

@Injectable()
export class CourseService {
  constructor(
    @Inject('COURSE_SERVICE')
    private readonly courseClient: ClientProxy,
  ) {}

  findAll(): Promise<Course[]> {
    return lastValueFrom(
      this.courseClient.send<Course[]>({ cmd: 'course.findAll' }, {}),
    ).then((courses) => courses.map(toCourse));
  }

  async findOne(id: number): Promise<Course | null> {
    const course = await lastValueFrom(
      this.courseClient.send<Course | null>({ cmd: 'course.findOne' }, id),
    );
    return course ? toCourse(course) : null;
  }

  async create(input: CreateCourseInput): Promise<Course> {
    const course = await lastValueFrom(
      this.courseClient.send<Course>({ cmd: 'course.create' }, input),
    );
    return toCourse(course);
  }

  async update(id: number, input: UpdateCourseInput): Promise<Course> {
    const course = await lastValueFrom(
      this.courseClient.send<Course>(
        { cmd: 'course.update' },
        { id, input },
      ),
    );
    return toCourse(course);
  }

  async delete(id: number): Promise<boolean> {
    return lastValueFrom(
      this.courseClient.send<boolean>({ cmd: 'course.delete' }, id),
    );
  }
}
