import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  CourseProfileCreateDto,
  CourseProfileQueryDto,
  CourseProfileUpdateDto,
} from './dto/course-profile.dto';

@Injectable()
export class CourseProfileService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(query: CourseProfileQueryDto) {
    const q = query.q?.trim();
    return this.prisma.courseProfile.findMany({
      where: {
        subject: query.subject ?? undefined,
        level: query.level ?? undefined,
        ...(q
          ? {
            OR: [
              { code: { contains: q, mode: 'insensitive' } },
              { title: { contains: q, mode: 'insensitive' } },
            ],
          }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const item = await this.prisma.courseProfile.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('CourseProfile not found');
    return item;
  }

  async create(input: CourseProfileCreateDto) {
    return this.prisma.courseProfile.create({
      data: {
        code: input.code,
        title: input.title,
        shortTitle: input.shortTitle,
        description: input.description,
        subject: input.subject,
        level: input.level,
        defaultLanguage: input.defaultLanguage,
        thumbnailUrl: input.thumbnailUrl,
      },
    });
  }

  async update(id: string, input: CourseProfileUpdateDto) {
    await this.findById(id);
    return this.prisma.courseProfile.update({
      where: { id },
      data: {
        title: input.title,
        shortTitle: input.shortTitle,
        description: input.description,
        subject: input.subject,
        level: input.level,
        defaultLanguage: input.defaultLanguage,
        thumbnailUrl: input.thumbnailUrl,
      },
    });
  }

  async archiveProfile(id: string) {
    await this.findById(id);

    // Archive all editions
    await this.prisma.courseEdition.updateMany({
      where: { courseProfileId: id, status: { in: ['PUBLISHED', 'DRAFT'] } },
      data: { status: 'ARCHIVED', isCurrent: false },
    });

    return this.prisma.courseProfile.update({
      where: { id },
      data: {
        metadata: {
          ...(await this.findById(id)).metadata as any,
          isArchived: true,
          archivedAt: new Date().toISOString()
        }
      },
    });
  }

  async delete(id: string) {
    const profile = await this.prisma.courseProfile.findUnique({
      where: { id },
      include: {
        editions: { select: { id: true }, take: 1 },
        classes: { select: { id: true }, take: 1 },
      },
    });
    if (!profile) throw new NotFoundException('CourseProfile not found');

    if (profile.editions.length > 0 || profile.classes.length > 0) {
      throw new Error('Cannot delete CourseProfile with existing editions or classes. Archive it instead.');
    }

    await this.prisma.courseProfile.delete({ where: { id } });
    return { ok: true };
  }
}

