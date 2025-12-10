import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCourseDto, UpdateCourseDto } from './course.dto';
import { Course } from './course.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
  ) {}

  findAll(): Promise<Course[]> {
    return this.courseRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Course | null> {
    return this.courseRepo.findOne({ where: { id } });
  }

  async create(input: CreateCourseDto): Promise<Course> {
    const course = this.courseRepo.create({
      ...input,
      published: input.published ?? false,
    });
    return this.courseRepo.save(course);
  }

  async update(id: number, input: UpdateCourseDto): Promise<Course> {
    const existing = await this.courseRepo.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Course ${id} not found`);
    }

    Object.assign(existing, input);
    return this.courseRepo.save(existing);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.courseRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

