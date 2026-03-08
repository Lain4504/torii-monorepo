import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, OfferingStatus, OrderType } from '@prisma/generated';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../../audit-logger.service';
import {
  CourseOfferingCreateDto,
  CourseOfferingQueryDto,
  CourseOfferingSetClassesDto,
  CourseOfferingUpdateDto,
} from './dto/course-offering.dto';

@Injectable()
export class CourseOfferingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
  ) { }

  async findAll(query: CourseOfferingQueryDto) {
    const q = query.q?.trim();
    return this.prisma.courseOffering.findMany({
      where: {
        status: query.status as OfferingStatus,
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
      include: {
        classes: {
          include: {
            class: {
              include: {
                courseProfile: {
                  select: {
                    level: true,
                    subject: true,
                    thumbnailUrl: true,
                  },
                },
                liveClass: {
                  include: {
                    primaryTeacher: {
                      select: {
                        displayName: true,
                        avatarUrl: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    const item = await this.prisma.courseOffering.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            class: {
              include: {
                courseProfile: true,
                courseEdition: {
                  include: {
                    chapters: {
                      orderBy: { orderIndex: 'asc' },
                      include: {
                        items: {
                          orderBy: { orderIndex: 'asc' },
                        },
                      },
                    },
                  },
                },
                liveClass: {
                  include: {
                    primaryTeacher: {
                      select: {
                        displayName: true,
                        avatarUrl: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!item) throw new NotFoundException('CourseOffering not found');
    return item as any;
  }

  async create(input: CourseOfferingCreateDto, requesterId = 'SYSTEM') {
    if (input.status === OfferingStatus.PUBLISHED) {
      if (!input.classIds?.length) {
        throw new BadRequestException('Active offering must have at least one class');
      }
      // Check sales dates
      if (input.validFrom && input.validTo && input.validFrom > input.validTo) {
        throw new BadRequestException('validFrom cannot be after validTo');
      }
    }

    if (input.classIds?.length) {
      const count = await this.prisma.class.count({
        where: { id: { in: input.classIds } },
      });
      if (count !== input.classIds.length) {
        throw new BadRequestException('Some classIds do not exist');
      }
    }

    const offering = await this.prisma.courseOffering.create({
      data: {
        code: input.code,
        title: input.title,
        description: input.description,
        originalPrice: new Prisma.Decimal(input.originalPrice),
        currency: input.currency,
        status: input.status as OfferingStatus || OfferingStatus.DRAFT,
        type: input.type as OrderType || OrderType.COURSE,
        validFrom: input.validFrom,
        validTo: input.validTo,
        metadata: input.metadata ?? undefined,
        classes: input.classIds?.length
          ? {
            create: input.classIds.map((classId) => ({ classId })),
          }
          : undefined,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'offering.create',
      entity: 'CourseOffering',
      entityId: offering.id,
      description: `Created course offering: ${offering.title} (${offering.code}) with status ${offering.status}`,
      newValues: { code: offering.code, status: offering.status, originalPrice: offering.originalPrice },
    });

    return offering;
  }

  async update(id: string, input: CourseOfferingUpdateDto, requesterId = 'SYSTEM') {
    const offering = await this.findById(id) as any;

    if (input.status === OfferingStatus.PUBLISHED) {
      if (!offering.classes || offering.classes.length === 0) {
        throw new BadRequestException('Cannot activate offering with no classes');
      }
      const start = input.validFrom || offering.validFrom;
      const end = input.validTo || offering.validTo;
      if (start && end && start > end) {
        throw new BadRequestException('validFrom cannot be after validTo');
      }
    }

    if (input.classIds?.length) {
      const count = await this.prisma.class.count({
        where: { id: { in: input.classIds } },
      });
      if (count !== input.classIds.length) {
        throw new BadRequestException('Some classIds do not exist');
      }
    }

    const updated = await this.prisma.courseOffering.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        originalPrice: input.originalPrice !== undefined ? new Prisma.Decimal(input.originalPrice) : undefined,
        currency: input.currency,
        status: input.status as OfferingStatus,
        type: input.type as OrderType,
        validFrom: input.validFrom,
        validTo: input.validTo,
        metadata: input.metadata ?? undefined,
        classes: input.classIds
          ? {
            deleteMany: {},
            create: input.classIds.map((classId) => ({ classId })),
          }
          : undefined,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'offering.update',
      entity: 'CourseOffering',
      entityId: id,
      description: `Updated course offering: ${offering.title} (${offering.code})`,
      oldValues: { status: offering.status, originalPrice: offering.originalPrice },
      newValues: { status: updated.status, originalPrice: updated.originalPrice },
    });

    return updated;
  }

  async submitForApproval(id: string, requesterId: string) {
    const offering = await this.findById(id);
    if (offering.status !== OfferingStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT offerings can be submitted for approval');
    }

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
      throw new BadRequestException('Only PENDING_APPROVAL offerings can be approved');
    }

    if (!offering.classes || offering.classes.length === 0) {
      throw new BadRequestException('Cannot approve offering with no classes');
    }

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
      throw new BadRequestException('Only PENDING_APPROVAL offerings can be rejected');
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

  async setClasses(input: CourseOfferingSetClassesDto, requesterId = 'SYSTEM') {
    await this.findById(input.offeringId);
    const count = await this.prisma.class.count({
      where: { id: { in: input.classIds } },
    });
    if (count !== input.classIds.length) {
      throw new BadRequestException('Some classIds do not exist');
    }

    await this.prisma.$transaction([
      this.prisma.courseOfferingClass.deleteMany({
        where: { offeringId: input.offeringId },
      }),
      this.prisma.courseOfferingClass.createMany({
        data: input.classIds.map((classId) => ({
          offeringId: input.offeringId,
          classId,
        })),
        skipDuplicates: true,
      }),
    ]);

    await this.audit.log({
      userId: requesterId,
      action: 'offering.setClasses',
      entity: 'CourseOffering',
      entityId: input.offeringId,
      description: `Set classes for offering: ${input.offeringId}`,
      metadata: { classIds: input.classIds },
    });

    return this.findById(input.offeringId);
  }

  async archive(id: string, requesterId = 'SYSTEM') {
    const offering = await this.findById(id) as any;
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
    if (offering.status !== OfferingStatus.DRAFT && offering.status !== OfferingStatus.PENDING_APPROVAL) {
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

