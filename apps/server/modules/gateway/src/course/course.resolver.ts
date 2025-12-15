import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Course, CreateCourseInput, UpdateCourseInput } from './course.schema';

@Resolver(() => Course)
export class CourseResolver {
  constructor(
    @Inject('COURSE_SERVICE')
    private readonly courseClient: ClientProxy,
  ) { }

  @Query(() => [Course], { name: 'courses' })
  courses(): Promise<Course[]> {
    return lastValueFrom(
      this.courseClient.send<Course[]>({ cmd: 'course.findAll' }, {}),
    ).then((courses) => courses.map(toCourse));
  }

  @Query(() => Course, { name: 'course', nullable: true })
  async course(@Args('id', { type: () => Int }) id: number): Promise<Course | null> {
    const course = await lastValueFrom(
      this.courseClient.send<Course | null>({ cmd: 'course.findOne' }, id),
    );
    return course ? toCourse(course) : null;
  }

  @Mutation(() => Course)
  async createCourse(@Args('input') input: CreateCourseInput): Promise<Course> {
    const course = await lastValueFrom(
      this.courseClient.send<Course>({ cmd: 'course.create' }, input),
    );
    return toCourse(course);
  }

  @Mutation(() => Course)
  async updateCourse(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateCourseInput,
  ): Promise<Course> {
    const course = await lastValueFrom(
      this.courseClient.send<Course>({ cmd: 'course.update' }, { id, input }),
    );
    return toCourse(course);
  }

  @Mutation(() => Boolean)
  deleteCourse(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return lastValueFrom(
      this.courseClient.send<boolean>({ cmd: 'course.delete' }, id),
    );
  }
}

const toCourse = (data: any): Course => ({
  ...data,
  createdAt: data?.createdAt ? new Date(data.createdAt) : data?.createdAt,
  updatedAt: data?.updatedAt ? new Date(data.updatedAt) : data?.updatedAt,
});
