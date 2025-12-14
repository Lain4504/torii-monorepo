import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Course } from './course.entity';
import { CreateCourseInput, UpdateCourseInput } from './course.input';
import { CourseService } from './course.service';

@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query(() => [Course], { name: 'courses' })
  courses(): Promise<Course[]> {
    return this.courseService.findAll();
  }

  @Query(() => Course, { name: 'course', nullable: true })
  course(@Args('id', { type: () => Int }) id: number): Promise<Course | null> {
    return this.courseService.findOne(id);
  }

  @Mutation(() => Course)
  createCourse(
    @Args('input') input: CreateCourseInput,
  ): Promise<Course> {
    return this.courseService.create(input);
  }

  @Mutation(() => Course)
  updateCourse(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateCourseInput,
  ): Promise<Course> {
    return this.courseService.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteCourse(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.courseService.delete(id);
  }
}

