import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/generated';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  AssignmentTemplateCreateDto,
  AssignmentTemplateQueryDto,
  AssignmentTemplateUpdateDto,
} from './dto/assignment-template.dto';

@Injectable()
export class AssignmentTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AssignmentTemplateQueryDto) {
    return this.prisma.assignmentTemplate.findMany({
      where: { courseProfileId: query.courseProfileId ?? undefined },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.assignmentTemplate.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('AssignmentTemplate not found');
    return item;
  }

  async create(input: AssignmentTemplateCreateDto) {
    const profile = await this.prisma.courseProfile.findUnique({
      where: { id: input.courseProfileId },
      select: { id: true },
    });
    if (!profile) throw new BadRequestException('Invalid courseProfileId');

    return this.prisma.assignmentTemplate.create({
      data: {
        courseProfileId: input.courseProfileId,
        title: input.title,
        description: input.description,
        defaultType: input.defaultType as any,
        defaultMaxScore:
          input.defaultMaxScore !== undefined
            ? new Prisma.Decimal(input.defaultMaxScore)
            : undefined,
        defaultRubric: input.defaultRubric ?? undefined,
        defaultSubmissionSettings: input.defaultSubmissionSettings ?? undefined,
      } as any,
    });
  }

  async update(id: string, input: AssignmentTemplateUpdateDto) {
    await this.findById(id);
    return this.prisma.assignmentTemplate.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        defaultType: input.defaultType as any,
        defaultMaxScore:
          input.defaultMaxScore !== undefined
            ? new Prisma.Decimal(input.defaultMaxScore)
            : undefined,
        defaultRubric: input.defaultRubric ?? undefined,
        defaultSubmissionSettings: input.defaultSubmissionSettings ?? undefined,
      } as any,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.assignmentTemplate.delete({ where: { id } });
    return { ok: true };
  }
}

