import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  OfferingStatus,
  ClassStatus,
  ClassMode,
} from '@prisma/generated';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../../audit-logger.service';
import { LiveClassCapacityService } from '../../classroom/class/live-class-capacity.service';
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
    private readonly liveClassCapacity: LiveClassCapacityService,
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
      courseProfileId: item.courseProfileId,
      termId: item.termId,
      classId: item.classId,
      class: klass,
      courseProfile: item.courseProfile,
      term: item.term,
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
            courseProfile: {
              level: { equals: query.level, mode: 'insensitive' },
            },
          }
        : {}),
    };

    const offerings = await this.prisma.courseOffering.findMany({
      where,
      include: {
        courseProfile: {
          select: { id: true, title: true, code: true, level: true },
        },
        term: true,
        class: {
          include: {
            instructor: {
              select: { id: true, displayName: true, avatarUrl: true },
            },
            term: true, // Thêm cho chắc
          },
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
        courseProfile: {
          level: { equals: category, mode: 'insensitive' },
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
        courseProfile: true,
        term: true,
        class: {
          include: this.publicClassInclude,
        },
      },
    });
    if (!item) throw new NotFoundException('Offering not found');

    if (item.mode === 'LIVE') {
      const siblingClasses = await this.prisma.class.findMany({
        where: {
          courseProfileId: item.courseProfileId,
          mode: 'LIVE',
          termId: item.termId,
        },
        include: {
          instructor: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
          term: true,
        },
        orderBy: {
          term: {
            openingDate: 'asc',
          },
        },
      });
      return { ...item, classes: siblingClasses };
    }

    return item;
  }

  async findPublicById(id: string) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id },
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
        term: true,
        class: {
          include: {
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

    // Check enrollment window via Term
    const term = offering.term || offering.class?.term;
    if (offering.mode === 'LIVE' && term) {
      if (term.enrollmentCloseAt && term.enrollmentCloseAt < now) {
        isEnrollable = false;
        enrollableReason = 'ENROLLMENT_CLOSED';
      }
      if (term.enrollmentOpenAt && term.enrollmentOpenAt > now) {
        isEnrollable = false;
        enrollableReason = 'ENROLLMENT_NOT_YET_OPEN';
      }
    }

    const result = {
      ...this.thinPublicOffering(offering),
      isEnrollable,
      enrollableReason,
      courseProfile: offering.courseProfile,
      siblingClasses: [] as any[],
    };

    if (offering.mode === 'LIVE') {
      const siblingClasses = await this.prisma.class.findMany({
        where: {
          courseProfileId: offering.courseProfileId,
          mode: 'LIVE',
          status: { in: ['PUBLISHED', 'OPENING', 'ONGOING'] },
          termId: offering.termId,
        },
        include: {
          instructor: { select: { displayName: true, avatarUrl: true } },
          term: true,
        },
        orderBy: {
          term: {
            openingDate: 'asc',
          },
        },
      });
      result.siblingClasses =
        await this.liveClassCapacity.attachLiveEnrollmentSummary(siblingClasses);
    }

    return result;
  }

  async create(input: CourseOfferingCreateDto, requesterId = 'SYSTEM') {
    // TEMP DEBUG
    // eslint-disable-next-line no-console
    console.log('[CourseOfferingService.create] keys=', Object.keys(input), 'courseProfileId=', (input as any)?.courseProfileId);
    if (!input.courseProfileId) {
      throw new BadRequestException(
        'courseProfileId is mandatory for CourseOffering',
      );
    }
    if (!input.mode) {
      throw new BadRequestException(
        'mode (VOD/LIVE) is mandatory for CourseOffering',
      );
    }

    const item = await this.prisma.courseOffering.create({
      data: {
        mode: input.mode as any,
        courseProfileId: input.courseProfileId,
        termId: input.termId || null,
        classId: input.classId || null,
        code: input.code,
        title: input.title,
        description: input.description,
        price: input.price,
        salePrice: input.salePrice,
        currency: input.currency || 'VND',
        status: OfferingStatus.DRAFT,
        type: 'COURSE',
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

  async update(
    id: string,
    input: CourseOfferingUpdateDto,
    requesterId = 'SYSTEM',
  ) {
    const before = await this.prisma.courseOffering.findUnique({
      where: { id },
    });
    if (!before) throw new NotFoundException('Offering not found');

    const data: Prisma.CourseOfferingUncheckedUpdateInput = {
      title: input.title,
      description: input.description,
      price: input.price ? new Prisma.Decimal(input.price) : undefined,
      salePrice:
        input.salePrice !== undefined
          ? input.salePrice
            ? new Prisma.Decimal(input.salePrice)
            : null
          : undefined,
      courseProfileId: input.courseProfileId,
      termId: input.termId,
      classId: input.classId,
      status: (input.status as OfferingStatus) ?? undefined,
      validFrom:
        input.validFrom !== undefined
          ? input.validFrom
            ? new Date(input.validFrom)
            : null
          : undefined,
      validTo:
        input.validTo !== undefined
          ? input.validTo
            ? new Date(input.validTo)
            : null
          : undefined,
    };

    const item = await this.prisma.courseOffering.update({
      where: { id },
      data,
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
    const item = await this.prisma.courseOffering.findUnique({
      where: { id },
      include: {
        courseProfile: { select: { status: true } },
        class: { select: { mode: true, status: true } },
        term: { select: { status: true } },
      },
    });

    if (!item) throw new NotFoundException('Offering not found');

    const profileStatus = item.courseProfile?.status;
    if (profileStatus !== 'PUBLISHED') {
      throw new BadRequestException(
        `Cannot approve offering because course profile is not published (status: ${profileStatus ?? 'UNKNOWN'}).`,
      );
    }

    if (item.mode === 'LIVE') {
      if (!item.termId) {
        throw new BadRequestException(
          'LIVE offering must be attached to a Term',
        );
      }
      // You can add more gates here like checking if at least 1 class exists in term.
    } else {
      if (!item.classId) {
        throw new BadRequestException(
          'VOD offering must be attached to a Class (Blueprint)',
        );
      }
      const klass = item.class;
      if (!klass) throw new NotFoundException('Mapped VOD class not found');

      if (
        klass.status !== ClassStatus.PUBLISHED &&
        klass.status !== ClassStatus.OPENING &&
        klass.status !== ClassStatus.ONGOING
      ) {
        throw new BadRequestException(
          `Cannot approve offering because VOD class is not sellable (status: ${klass.status}).`,
        );
      }
    }

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
      throw new BadRequestException(
        'Cannot delete offering with active enrollments',
      );
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
