import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  OfferingStatus,
  OrderType,
  ClassStatus,
  ClassMode,
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
        },
      },
      instructor: {
        select: {
          displayName: true,
          avatarUrl: true,
        },
      },
      syllabus: {
        select: {
          id: true,
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
    const now = new Date();
    const modeFilter = query.mode as ClassMode | undefined;
    const hasEnrollableLiveClass = Boolean(query.hasEnrollableLiveClass);

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
      ...(modeFilter ? { mode: modeFilter } : {}),
      ...(modeFilter === ClassMode.LIVE && hasEnrollableLiveClass
        ? {
            class: {
              mode: ClassMode.LIVE,
              status: ClassStatus.OPENING,
              enrollmentOpenAt: { not: null, lte: now },
              enrollmentCloseAt: { not: null, gte: now },
            },
          }
        : {}),
    };

    const items = await this.prisma.courseOffering.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      include: {
        class: { include: this.publicClassInclude },
      },
    });

    return items.map((item) => this.thinPublicOffering(item));
  }

  async findPublicByCategory(category: string) {
    const items = await this.prisma.courseOffering.findMany({
      where: {
        status: OfferingStatus.PUBLISHED,
        class: {
          courseProfile: {
            level: { equals: category, mode: 'insensitive' },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      include: {
        class: { include: this.publicClassInclude },
      },
    });

    return items.map((item) => this.thinPublicOffering(item));
  }

  async findById(id: string) {
    const item = await this.prisma.courseOffering.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            courseProfile: true,
            syllabus: {
              include: {
                modules: {
                  orderBy: { orderIndex: 'asc' },
                  include: {
                    lessons: {
                      orderBy: { orderIndex: 'asc' },
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
          },
        },
      },
    });
    if (!item) throw new NotFoundException('CourseOffering not found');
    return item;
  }

  async findPublicById(id: string) {
    const item = await this.prisma.courseOffering.findUnique({
      where: { id },
      include: {
        class: {
          include: this.publicClassInclude,
        },
      },
    });

    if (!item) throw new NotFoundException('CourseOffering not found');

    const isVodAndPublished =
      item.mode === ClassMode.VOD && item.status === OfferingStatus.PUBLISHED;
    const isLiveAndOpeningOrPublished =
      item.mode === ClassMode.LIVE &&
      (item.status === OfferingStatus.OPENING ||
        item.status === OfferingStatus.PUBLISHED);

    if (!isVodAndPublished && !isLiveAndOpeningOrPublished) {
      throw new NotFoundException('CourseOffering not found');
    }

    const now = new Date();
    const thinned = this.thinPublicOffering(item)!;

    const isEnrollableLiveClass =
      item.mode === ClassMode.LIVE &&
      thinned.class?.mode === ClassMode.LIVE &&
      thinned.class?.status === ClassStatus.OPENING &&
      thinned.class?.enrollmentOpenAt &&
      thinned.class?.enrollmentCloseAt &&
      new Date(thinned.class.enrollmentOpenAt) <= now &&
      new Date(thinned.class.enrollmentCloseAt) >= now;

    return {
      ...thinned,
      enrollable: isEnrollableLiveClass,
    };
  }

  private async validateClassIdForOffering(classId: string) {
    const klass = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, code: true, status: true, mode: true },
    });
    if (!klass) throw new BadRequestException('Invalid classId');

    const validStatuses: ClassStatus[] = [
      ClassStatus.OPENING,
      ClassStatus.ONGOING,
      ClassStatus.PUBLISHED,
    ];
    if (!validStatuses.includes(klass.status)) {
      throw new BadRequestException(
        `Class ${klass.code} is in status ${klass.status}, which is not valid for selling`,
      );
    }
    return klass;
  }

  private async validateOfferingForPublish(id: string) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id },
      select: { classId: true },
    });
    if (!offering) throw new NotFoundException('Offering not found');
    await this.validateClassIdForOffering(offering.classId);
  }

  async create(input: CourseOfferingCreateDto, requesterId = 'SYSTEM') {
    if (input.status === OfferingStatus.PUBLISHED) {
      throw new BadRequestException(
        'Cannot create offering directly in PUBLISHED status. Use approval workflow.',
      );
    }

    await this.validateClassIdForOffering(input.classId);

    const offering = await this.prisma.courseOffering.create({
      data: {
        code: input.code,
        title: input.title,
        description: input.description,
        price: new Prisma.Decimal(input.price),
        salePrice: input.salePrice ? new Prisma.Decimal(input.salePrice) : null,
        currency: input.currency,
        mode: input.mode as ClassMode,
        classId: input.classId,
        status: (input.status as OfferingStatus) || OfferingStatus.DRAFT,
        type: (input.type as OrderType) || OrderType.COURSE,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'offering.create',
      entity: 'CourseOffering',
      entityId: offering.id,
      description: `Created course offering: ${offering.title} (${offering.code}) with status ${offering.status}`,
      newValues: {
        code: offering.code,
        status: offering.status,
        price: offering.price,
        mode: offering.mode,
      },
    });

    return offering;
  }

  async update(
    id: string,
    input: CourseOfferingUpdateDto,
    requesterId = 'SYSTEM',
  ) {
    const offering = await this.findById(id);

    if (input.status === OfferingStatus.PUBLISHED) {
      throw new BadRequestException(
        'Cannot update offering status to PUBLISHED directly. Use approval workflow.',
      );
    }

    // Governance: If PUBLISHED, any change to critical fields resets status to PENDING_APPROVAL (or DRAFT)
    let newStatus = (input.status as OfferingStatus) || offering.status;
    const criticalFieldsChanged =
      input.classId !== undefined ||
      (input.price !== undefined &&
        Number(input.price) !== Number(offering.price)) ||
      (input.salePrice !== undefined &&
        Number(input.salePrice) !== Number(offering.salePrice)) ||
      (input.title !== undefined && input.title !== offering.title) ||
      (input.mode !== undefined && input.mode !== offering.mode) ||
      false;

    let existingEnrollmentCount = 0;
    if (offering.status === OfferingStatus.PUBLISHED && criticalFieldsChanged) {
      newStatus = OfferingStatus.PENDING_APPROVAL; // Require re-approval
      existingEnrollmentCount = await this.prisma.enrollment.count({
        where: { offeringId: id },
      });
    }

    if (input.classId) {
      await this.validateClassIdForOffering(input.classId);
    }

    const updated = await this.prisma.courseOffering.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        price:
          input.price !== undefined
            ? new Prisma.Decimal(input.price)
            : undefined,
        salePrice:
          input.salePrice !== undefined
            ? new Prisma.Decimal(input.salePrice)
            : undefined,
        currency: input.currency,
        mode: (input.mode as ClassMode) || undefined,
        classId: input.classId || undefined,
        status: newStatus,
        type: input.type as OrderType,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'offering.update',
      entity: 'CourseOffering',
      entityId: id,
      description: `Updated course offering: ${offering.title} (${offering.code})`,
      oldValues: {
        status: offering.status,
        price: offering.price,
        mode: offering.mode,
      },
      newValues: {
        status: updated.status,
        price: updated.price,
        mode: updated.mode,
      },
      metadata:
        offering.status === OfferingStatus.PUBLISHED && criticalFieldsChanged
          ? {
              policy: 'NON_RETROACTIVE_ENTITLEMENT',
              previousBuyersUnaffected: true,
              existingEnrollmentCount,
            }
          : undefined,
    });

    return updated;
  }

  async submitForApproval(id: string, requesterId: string) {
    const offering = await this.findById(id);
    if (
      offering.status !== OfferingStatus.DRAFT &&
      offering.status !== OfferingStatus.PUBLISHED
    ) {
      throw new BadRequestException(
        'Only DRAFT or PUBLISHED offerings can be submitted for approval',
      );
    }

    await this.validateOfferingForPublish(id);

    const updated = await this.prisma.courseOffering.update({
      where: { id },
      data: {
        status: OfferingStatus.PENDING_APPROVAL,
        submittedForApprovalAt: new Date(),
        submittedBy: requesterId,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'offering.submit',
      entity: 'CourseOffering',
      entityId: id,
      description: `Submitted course offering ${offering.title} for approval`,
    });

    return updated;
  }

  async approve(id: string, requesterId: string) {
    const offering = await this.findById(id);
    if (offering.status !== OfferingStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        'Only PENDING_APPROVAL offerings can be approved',
      );
    }

    await this.validateOfferingForPublish(id);

    const updated = await this.prisma.courseOffering.update({
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
      description: `Approved course offering ${offering.title}`,
    });

    return updated;
  }

  async reject(id: string, reason: string, requesterId: string) {
    const offering = await this.findById(id);
    if (offering.status !== OfferingStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        'Only PENDING_APPROVAL offerings can be rejected',
      );
    }

    const updated = await this.prisma.courseOffering.update({
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
      description: `Rejected course offering ${offering.title} for reason: ${reason}`,
      metadata: { reason },
    });

    return updated;
  }

  async archive(id: string, requesterId = 'SYSTEM') {
    const offering = await this.findById(id);
    if (offering.status === OfferingStatus.ARCHIVED) {
      return offering;
    }
    const updated = await this.prisma.courseOffering.update({
      where: { id },
      data: { status: OfferingStatus.ARCHIVED },
    });
    await this.audit.log({
      userId: requesterId,
      action: 'offering.archive',
      entity: 'CourseOffering',
      entityId: id,
      description: `Archived course offering: ${offering.title} (${offering.code})`,
      metadata: { code: offering.code },
    });
    return updated;
  }

  async delete(id: string, requesterId = 'SYSTEM') {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id },
      include: {
        orderItems: { select: { id: true }, take: 1 },
      },
    });
    if (!offering) throw new NotFoundException('CourseOffering not found');

    if (offering.orderItems.length > 0) {
      throw new BadRequestException(
        'Cannot delete offering with existing orders. Use archive instead.',
      );
    }
    if (
      offering.status !== OfferingStatus.DRAFT &&
      offering.status !== OfferingStatus.PENDING_APPROVAL
    ) {
      throw new BadRequestException(
        'Can only delete DRAFT or PENDING_APPROVAL offerings. Use archive instead.',
      );
    }

    await this.prisma.courseOffering.delete({ where: { id } });

    await this.audit.log({
      userId: requesterId,
      action: 'offering.delete',
      entity: 'CourseOffering',
      entityId: id,
      description: `Deleted course offering: ${offering.title} (${offering.code})`,
      metadata: { code: offering.code, status: offering.status },
    });

    return { ok: true };
  }
}
