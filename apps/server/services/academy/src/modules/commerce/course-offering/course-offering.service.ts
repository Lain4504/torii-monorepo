import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  OfferingStatus,
} from '@prisma/generated';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../../audit-logger.service';
import {
  CourseOfferingCreateDto,
  CourseOfferingQueryDto,
  CourseOfferingUpdateDto,
} from './dto/course-offering.dto';

@Injectable()
export class CourseOfferingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
  ) {}

  private get publicClassInclude() {
    return {
      courseProfile: {
        select: {
          id: true,
          code: true,
          title: true,
          description: true,
          level: true,
          thumbnailUrl: true,
          modules: {
            orderBy: { orderIndex: 'asc' as const },
            select: {
              id: true,
              title: true,
              orderIndex: true,
              lessons: {
                orderBy: { orderIndex: 'asc' as const },
                select: {
                  id: true,
                  type: true,
                  title: true,
                  orderIndex: true,
                },
              },
            },
          },
        },
      },
      instructor: {
        select: {
          displayName: true,
          avatarUrl: true,
        },
      },
    };
  }

  private thinPublicOffering(item: any) {
    if (!item) return null;
    const klass = item.class;
    return {
      id: item.id,
      code: item.code,
      title: item.title,
      description: item.description,
      price: Number(item.price || 0),
      salePrice: item.salePrice ? Number(item.salePrice) : null,
      currency: item.currency,
      mode: item.mode,
      status: item.status,
      class: klass,
      validFrom: item.validFrom,
      validTo: item.validTo,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  async findAll(query: CourseOfferingQueryDto) {
    const q = query.q?.trim();
    const modeFilter = query.mode;

    const where: Prisma.CourseOfferingWhereInput = {
      status: query.status as OfferingStatus,
      ...(q
        ? {
            OR: [
              { code: { contains: q, mode: 'insensitive' } },
              { title: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(modeFilter ? { mode: modeFilter as any } : {}),
      ...(query.level
        ? {
            class: {
              courseProfile: { level: { equals: query.level, mode: 'insensitive' } },
            },
          }
        : {}),
    };

    const offerings = await this.prisma.courseOffering.findMany({
      where,
      include: {
        class: {
          include: this.publicClassInclude,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return offerings.map((o) => this.thinPublicOffering(o));
  }

  async findByCategory(category: string) {
    const offerings = await this.prisma.courseOffering.findMany({
      where: {
        status: OfferingStatus.PUBLISHED,
        class: {
          courseProfile: {
            level: { equals: category, mode: 'insensitive' },
          },
        },
      },
      include: {
        class: {
          include: this.publicClassInclude,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return offerings.map((o) => this.thinPublicOffering(o));
  }

  async findById(id: string) {
    const item = await this.prisma.courseOffering.findUnique({
      where: { id },
      include: {
        class: {
          include: this.publicClassInclude,
        },
      },
    });
    if (!item) throw new NotFoundException('Offering not found');
    return item;
  }

  async findPublicById(id: string) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            courseProfile: {
              include: {
                modules: {
                  orderBy: { orderIndex: 'asc' },
                  include: {
                    lessons: { orderBy: { orderIndex: 'asc' } },
                  },
                },
              },
            },
            instructor: { select: { displayName: true, avatarUrl: true } },
            term: true,
          },
        },
      },
    });

    if (!offering) throw new NotFoundException('Offering not found');
    
    // Enrollability check Logic
    let isEnrollable = true;
    let enrollableReason = 'OK';

    if (offering.status !== 'PUBLISHED') {
      isEnrollable = false;
      enrollableReason = 'OFFERING_NOT_PUBLISHED';
    }

    const now = new Date();
    if (offering.validFrom && offering.validFrom > now) {
      isEnrollable = false;
      enrollableReason = 'OFFERING_BEFORE_START';
    }
    if (offering.validTo && offering.validTo < now) {
      isEnrollable = false;
      enrollableReason = 'OFFERING_EXPIRED';
    }

    const klass = offering.class;
    if (klass.mode === 'LIVE' && klass.term) {
       if (klass.term.enrollmentCloseAt && klass.term.enrollmentCloseAt < now) {
          isEnrollable = false;
          enrollableReason = 'ENROLLMENT_CLOSED';
       }
    }

    return {
      ...this.thinPublicOffering(offering),
      isEnrollable,
      enrollableReason,
    };
  }

  async create(input: CourseOfferingCreateDto, requesterId = 'SYSTEM') {
    const klass = await this.prisma.class.findUnique({
      where: { id: input.classId },
      select: { mode: true },
    });
    if (!klass) throw new BadRequestException('Invalid classId');

    const item = await this.prisma.courseOffering.create({
      data: {
        classId: input.classId,
        code: input.code,
        title: input.title,
        description: input.description,
        price: input.price,
        salePrice: input.salePrice,
        currency: input.currency || 'VND',
        mode: klass.mode as any,
        status: OfferingStatus.DRAFT,
        validFrom: input.validFrom ? new Date(input.validFrom) : null,
        validTo: input.validTo ? new Date(input.validTo) : null,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'offering.create',
      entity: 'CourseOffering',
      entityId: item.id,
      description: `Created offering ${item.code}`,
      newValues: item,
    });

    return item;
  }

  async update(id: string, input: CourseOfferingUpdateDto, requesterId = 'SYSTEM') {
    const before = await this.prisma.courseOffering.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Offering not found');

    const item = await this.prisma.courseOffering.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        price: input.price,
        salePrice: input.salePrice,
        status: (input.status as OfferingStatus) ?? undefined,
        validFrom: input.validFrom ? new Date(input.validFrom) : undefined,
        validTo: input.validTo ? new Date(input.validTo) : undefined,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'offering.update',
      entity: 'CourseOffering',
      entityId: id,
      description: `Updated offering ${before.code}`,
      oldValues: before,
      newValues: item,
    });

    return item;
  }

  async submitForApproval(id: string, requesterId: string) {
    const item = await this.findById(id);
    const result = await this.prisma.courseOffering.update({
      where: { id },
      data: { 
        status: OfferingStatus.PENDING_APPROVAL,
        submittedForApprovalAt: new Date(),
        submittedBy: requesterId,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'offering.submit_approval',
      entity: 'CourseOffering',
      entityId: id,
      description: `Submitted offering ${item.code} for approval`,
    });

    return result;
  }

  async approve(id: string, requesterId: string) {
     const item = await this.findById(id);
     const result = await this.prisma.courseOffering.update({
       where: { id },
       data: { 
         status: OfferingStatus.PUBLISHED,
         approvedAt: new Date(),
         approvedBy: requesterId,
       },
     });

     await this.audit.log({
       userId: requesterId,
       action: 'offering.approve',
       entity: 'CourseOffering',
       entityId: id,
       description: `Approved offering ${item.code}`,
     });

     return result;
  }

  async reject(id: string, reason: string, requesterId: string) {
    const item = await this.findById(id);
    const result = await this.prisma.courseOffering.update({
      where: { id },
      data: { 
        status: OfferingStatus.DRAFT,
        rejectedAt: new Date(),
        rejectedBy: requesterId,
        rejectionReason: reason,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'offering.reject',
      entity: 'CourseOffering',
      entityId: id,
      description: `Rejected offering ${item.code}: ${reason}`,
    });

    return result;
  }

  async publish(id: string, requesterId = 'SYSTEM') {
    return this.approve(id, requesterId);
  }

  async archive(id: string, requesterId = 'SYSTEM') {
    const item = await this.prisma.courseOffering.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Offering not found');

    const result = await this.prisma.courseOffering.update({
      where: { id },
      data: { status: OfferingStatus.ARCHIVED },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'offering.archive',
      entity: 'CourseOffering',
      entityId: id,
      description: `Archived offering ${item.code}`,
    });

    return result;
  }

  async delete(id: string, requesterId = 'SYSTEM') {
    const item = await this.prisma.courseOffering.findUnique({
      where: { id },
      include: { _count: { select: { enrollments: true } } },
    });
    if (!item) throw new NotFoundException('Offering not found');

    if (item._count.enrollments > 0) {
      throw new BadRequestException('Cannot delete offering with active enrollments');
    }

    await this.prisma.courseOffering.delete({ where: { id } });

    await this.audit.log({
      userId: requesterId,
      action: 'offering.delete',
      entity: 'CourseOffering',
      entityId: id,
      description: `Deleted offering ${item.code}`,
    });

    return { ok: true };
  }
}
