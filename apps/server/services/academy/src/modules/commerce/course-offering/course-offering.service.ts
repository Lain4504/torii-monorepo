import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async findPublicById(id: string) {
    const item = await this.findById(id);
    if (item.status !== OfferingStatus.PUBLISHED) {
      throw new NotFoundException('CourseOffering not found');
    }
    const now = new Date();
    if ((item.validFrom && new Date(item.validFrom) > now) || (item.validTo && new Date(item.validTo) < now)) {
      throw new NotFoundException('CourseOffering not found');
    }
    return item;
  }

  private async validateClassIdsForSelling(classIds: string[]) {
    if (!classIds.length) {
      throw new BadRequestException(
        'Course offering must have at least one class to be published',
      );
    }

    const classes = await this.prisma.class.findMany({
      where: { id: { in: classIds } },
      include: {
        courseEdition: {
          select: { status: true },
        },
      },
    });

    if (classes.length !== classIds.length) {
      throw new BadRequestException('Some classIds do not exist');
    }

    const validStatuses = ['ENROLLING', 'IN_PROGRESS'];
    for (const cls of classes) {
      if (!validStatuses.includes(cls.status)) {
        throw new BadRequestException(
          `Class ${cls.code} is in status ${cls.status}, which is not valid for enrollment`,
        );
      }
      if (cls.courseEdition.status !== 'PUBLISHED') {
        throw new BadRequestException(
          `Class ${cls.code} uses course edition ${cls.courseEditionId}, which is not PUBLISHED`,
        );
      }
    }
  }

  private async validateClassIdsExist(classIds: string[]) {
    const count = await this.prisma.class.count({
      where: { id: { in: classIds } },
    });
    if (count !== classIds.length) {
      throw new BadRequestException('Some classIds do not exist');
    }
  }

  private async validateOfferingForPublish(id: string) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id },
      include: {
        classes: {
          select: { classId: true },
        },
      },
    });
    if (!offering) throw new NotFoundException('Offering not found');
    await this.validateClassIdsForSelling(
      offering.classes.map((item) => item.classId),
    );
  }

  async create(input: CourseOfferingCreateDto, requesterId = 'SYSTEM') {
    if (input.status === OfferingStatus.PUBLISHED) {
      throw new BadRequestException(
        'Cannot create offering directly in PUBLISHED status. Use approval workflow.',
      );
    }

    if (
      input.classIds?.length &&
      (input.status === OfferingStatus.PENDING_APPROVAL ||
        input.status === OfferingStatus.PUBLISHED)
    ) {
      await this.validateClassIdsForSelling(input.classIds);
    } else if (input.classIds?.length) {
      await this.validateClassIdsExist(input.classIds);
    }

    const offering = await this.prisma.courseOffering.create({
      data: {
        code: input.code,
        title: input.title,
        description: input.description,
        originalPrice: new Prisma.Decimal(input.originalPrice),
        currency: input.currency,
        status: (input.status as OfferingStatus) || OfferingStatus.DRAFT,
        type: (input.type as OrderType) || OrderType.COURSE,
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
      newValues: {
        code: offering.code,
        status: offering.status,
        originalPrice: offering.originalPrice,
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
      input.classIds !== undefined ||
      (input.originalPrice !== undefined &&
        Number(input.originalPrice) !== Number(offering.originalPrice)) ||
      (input.title !== undefined && input.title !== offering.title) ||
      input.validFrom !== undefined ||
      input.validTo !== undefined;

    let existingEnrollmentCount = 0;
    if (offering.status === OfferingStatus.PUBLISHED && criticalFieldsChanged) {
      newStatus = OfferingStatus.PENDING_APPROVAL; // Require re-approval
      existingEnrollmentCount = await this.prisma.enrollment.count({
        where: { sourceOfferingId: id },
      });
    }

    if (
      input.classIds?.length &&
      (newStatus === OfferingStatus.PENDING_APPROVAL ||
        newStatus === OfferingStatus.PUBLISHED)
    ) {
      await this.validateClassIdsForSelling(input.classIds);
    } else if (input.classIds?.length) {
      await this.validateClassIdsExist(input.classIds);
    }

    const updated = await this.prisma.courseOffering.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        originalPrice:
          input.originalPrice !== undefined
            ? new Prisma.Decimal(input.originalPrice)
            : undefined,
        currency: input.currency,
        status: newStatus,
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
      oldValues: {
        status: offering.status,
        originalPrice: offering.originalPrice,
      },
      newValues: {
        status: updated.status,
        originalPrice: updated.originalPrice,
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

  async setClasses(input: CourseOfferingSetClassesDto, requesterId = 'SYSTEM') {
    const offering = await this.findById(input.offeringId);
    if (!input.classIds.length) {
      if (
        offering.status === OfferingStatus.PUBLISHED ||
        offering.status === OfferingStatus.PENDING_APPROVAL
      ) {
        throw new BadRequestException(
          'Course offering must have at least one class to be published',
        );
      }
    } else if (
      offering.status === OfferingStatus.PUBLISHED ||
      offering.status === OfferingStatus.PENDING_APPROVAL
    ) {
      await this.validateClassIdsForSelling(input.classIds);
    } else {
      await this.validateClassIdsExist(input.classIds);
    }

    const nextStatus =
      offering.status === OfferingStatus.PUBLISHED
        ? OfferingStatus.PENDING_APPROVAL
        : offering.status;
    const existingEnrollmentCount =
      offering.status === OfferingStatus.PUBLISHED
        ? await this.prisma.enrollment.count({
          where: { sourceOfferingId: input.offeringId },
        })
        : 0;

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
      this.prisma.courseOffering.update({
        where: { id: input.offeringId },
        data: { status: nextStatus },
      }),
    ]);

    await this.audit.log({
      userId: requesterId,
      action: 'offering.setClasses',
      entity: 'CourseOffering',
      entityId: input.offeringId,
      description: `Set classes for offering: ${input.offeringId}`,
      metadata: {
        classIds: input.classIds,
        previousStatus: offering.status,
        nextStatus,
        ...(offering.status === OfferingStatus.PUBLISHED
          ? {
            policy: 'NON_RETROACTIVE_ENTITLEMENT',
            previousBuyersUnaffected: true,
            existingEnrollmentCount,
          }
          : {}),
      },
    });

    return this.findById(input.offeringId);
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
