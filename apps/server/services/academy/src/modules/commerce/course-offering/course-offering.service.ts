import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/generated';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  CourseOfferingCreateDto,
  CourseOfferingQueryDto,
  CourseOfferingSetClassesDto,
  CourseOfferingUpdateDto,
} from './dto/course-offering.dto';

@Injectable()
export class CourseOfferingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CourseOfferingQueryDto) {
    const q = query.q?.trim();
    return this.prisma.courseOffering.findMany({
      where: {
        status: query.status ?? undefined,
        ...(q
          ? {
              OR: [
                { code: { contains: q, mode: 'insensitive' } },
                { title: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
      include: { classes: true },
    });
  }

  async findById(id: string) {
    const item = await this.prisma.courseOffering.findUnique({
      where: { id },
      include: { classes: { include: { class: true } } },
    });
    if (!item) throw new NotFoundException('CourseOffering not found');
    return item;
  }

  async create(input: CourseOfferingCreateDto) {
    if (input.classIds?.length) {
      const count = await this.prisma.class.count({
        where: { id: { in: input.classIds } },
      });
      if (count !== input.classIds.length) {
        throw new BadRequestException('Some classIds do not exist');
      }
    }

    return this.prisma.courseOffering.create({
      data: {
        code: input.code,
        title: input.title,
        description: input.description,
        price: new Prisma.Decimal(input.price),
        currency: input.currency,
        status: input.status ?? 'DRAFT',
        salesStartAt: input.salesStartAt,
        salesEndAt: input.salesEndAt,
        metadata: input.metadata ?? undefined,
        classes: input.classIds?.length
          ? {
              create: input.classIds.map((classId) => ({ classId })),
            }
          : undefined,
      } as any,
    });
  }

  async update(id: string, input: CourseOfferingUpdateDto) {
    await this.findById(id);
    return this.prisma.courseOffering.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        price: input.price !== undefined ? new Prisma.Decimal(input.price) : undefined,
        currency: input.currency,
        status: input.status,
        salesStartAt: input.salesStartAt,
        salesEndAt: input.salesEndAt,
        metadata: input.metadata ?? undefined,
      } as any,
    });
  }

  async setClasses(input: CourseOfferingSetClassesDto) {
    await this.findById(input.offeringId);
    const count = await this.prisma.class.count({
      where: { id: { in: input.classIds } },
    });
    if (count !== input.classIds.length) {
      throw new BadRequestException('Some classIds do not exist');
    }

    await this.prisma.courseOfferingClass.deleteMany({
      where: { offeringId: input.offeringId },
    });

    await this.prisma.courseOfferingClass.createMany({
      data: input.classIds.map((classId) => ({
        offeringId: input.offeringId,
        classId,
      })),
      skipDuplicates: true,
    });

    return this.findById(input.offeringId);
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.courseOffering.delete({ where: { id } });
    return { ok: true };
  }
}

