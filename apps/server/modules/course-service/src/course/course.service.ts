import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { Course } from '@prisma/generated';

import { CreateCourseDto, UpdateCourseDto } from './course.dto';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Course[]> {
    return this.prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Course | null> {
    return this.prisma.course.findUnique({
      where: { id },
    });
  }

  async create(input: CreateCourseDto): Promise<Course> {
    return this.prisma.course.create({
      data: {
        title: input.title,
        description: input.description,
        price: input.price,
        published: input.published ?? false,
      },
    });
  }

  async update(id: number, input: UpdateCourseDto): Promise<Course> {
    const existing = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Course ${id} not found`);
    }

    return this.prisma.course.update({
      where: { id },
      data: input,
    });
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.course.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
