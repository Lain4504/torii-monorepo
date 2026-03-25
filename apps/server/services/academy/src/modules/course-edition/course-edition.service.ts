import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../audit-logger.service';
import {
  AcademyCourseEditionCreateDTO,
  AcademyCourseEditionModel,
  AcademyCourseEditionQueryDTO,
  AcademyCourseEditionUpdateDTO,
} from '@workspace/schemas';

@Injectable()
export class CourseEditionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
  ) {}

  async findAll(
    query: AcademyCourseEditionQueryDTO,
  ): Promise<AcademyCourseEditionModel[]> {
    const q = query.q?.trim();

    const where: any = {};
    if (typeof query.isActive === 'boolean') where.isActive = query.isActive;
    if (q) {
      where.OR = [
        { key: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { level: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.courseEdition.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<AcademyCourseEditionModel> {
    const item = await this.prisma.courseEdition.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('CourseEdition not found');
    return item;
  }

  async create(input: AcademyCourseEditionCreateDTO, requesterId?: string) {
    const exists = await this.prisma.courseEdition.findUnique({
      where: { key: input.key },
      select: { id: true },
    });
    if (exists) {
      throw new BadRequestException(
        `CourseEdition key '${input.key}' already exists`,
      );
    }

    const item = await this.prisma.courseEdition.create({
      data: {
        key: input.key,
        title: input.title ?? null,
        level: input.level ?? null,
        isActive: input.isActive ?? true,
      },
    });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'courseEdition.create',
        entity: 'CourseEdition',
        entityId: item.id,
        description: `Create CourseEdition ${item.key}`,
        newValues: item,
      });
    }

    return item;
  }

  async update(
    id: string,
    input: AcademyCourseEditionUpdateDTO,
    requesterId?: string,
  ) {
    const before = await this.prisma.courseEdition.findUnique({
      where: { id },
    });
    if (!before) throw new NotFoundException('CourseEdition not found');

    const item = await this.prisma.courseEdition.update({
      where: { id },
      data: {
        title: input.title ?? undefined,
        level: input.level ?? undefined,
        isActive: input.isActive ?? undefined,
      },
    });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'courseEdition.update',
        entity: 'CourseEdition',
        entityId: id,
        description: `Update CourseEdition ${before.key}`,
        oldValues: before,
        newValues: item,
      });
    }

    return item;
  }
}
