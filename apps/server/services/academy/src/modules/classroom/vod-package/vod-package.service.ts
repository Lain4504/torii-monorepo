import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  AcademyVodPackageCreateDTO,
  AcademyVodPackageUpdateDTO,
  AcademyVodPackageQueryDTO,
} from '@workspace/schemas';
import { AuditLoggerService } from '../../audit-logger.service';

@Injectable()
export class VodPackageService {
  private readonly logger = new Logger(VodPackageService.name);

  constructor(
    private prisma: PrismaService,
    private readonly audit: AuditLoggerService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  private async resolveRejectRecipient(
    packageId: string,
    reviewerId?: string,
  ): Promise<string | null> {
    const latestActor = await this.prisma.auditLog.findFirst({
      where: {
        entity: 'VodPackage',
        entityId: packageId,
        userId: reviewerId ? { not: reviewerId } : undefined,
      },
      orderBy: { createdAt: 'desc' },
      select: { userId: true },
    });
    return latestActor?.userId ?? null;
  }

  private notifyRejected(payload: {
    recipientId: string;
    packageId: string;
    packageCode: string;
    packageTitle: string;
    reason?: string | null;
  }) {
    this.natsClient.emit(
      { cmd: 'send_notification' },
      {
        recipientId: payload.recipientId,
        type: 'system',
        payload: {
          title: 'Yêu cầu của bạn đã bị từ chối',
          body: `Yêu cầu duyệt VOD Package ${payload.packageCode} đã bị từ chối.`,
          metadata: {
            entityType: 'VOD_PACKAGE',
            entityId: payload.packageId,
            code: payload.packageCode,
            title: payload.packageTitle,
            status: 'REJECTED',
            rejectionReason: payload.reason ?? '',
          },
        },
      },
    );
  }

  async findAll(query: AcademyVodPackageQueryDTO) {
    const where: any = {};
    if (query.courseProfileId) where.courseProfileId = query.courseProfileId;
    if (query.status) where.status = query.status;
    if ((query as any).level) {
      where.courseProfile = {
        ...where.courseProfile,
        level: (query as any).level,
      };
    }
    if (query.q) {
      where.OR = [
        { code: { contains: query.q, mode: 'insensitive' } },
        { title: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.vodPackage.findMany({
        where,
        include: {
          courseProfile: {
            select: { id: true, title: true, thumbnailUrl: true, level: true },
          },
          instructor: {
            select: { id: true, displayName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vodPackage.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string) {
    const item = await this.prisma.vodPackage.findUnique({
      where: { id },
      include: {
        courseProfile: { include: { modules: { include: { lessons: true } } } },
        instructor: { select: { id: true, displayName: true, email: true } },
      },
    });
    if (!item) throw new NotFoundException('VOD Package not found');
    return item;
  }

  async create(data: AcademyVodPackageCreateDTO) {
    return this.prisma.vodPackage.create({
      data: {
        courseProfileId: data.courseProfileId,
        code: data.code,
        title: data.title,
        price: data.price,
        discountPrice: data.discountPrice,
        status: (data.status as any) ?? 'DRAFT',
        rejectionReason: data.rejectionReason,
        instructorId: data.instructorId,
        thumbnailUrl: data.thumbnailUrl,
        submittedForApprovalAt:
          data.status === 'PENDING_APPROVAL' ? new Date() : undefined,
      },
    });
  }

  async update(
    id: string,
    data: AcademyVodPackageUpdateDTO,
    requesterId?: string,
  ) {
    const before = await this.prisma.vodPackage.findUnique({
      where: { id },
      include: { courseProfile: { select: { status: true } } },
    });
    if (!before) throw new NotFoundException('VOD Package not found');

    if (data.status === 'PUBLISHED' || data.status === 'PENDING_APPROVAL') {
      if (before.courseProfile.status !== 'PUBLISHED') {
        throw new BadRequestException(
          'Hồ sơ nội dung (Course Profile) cần được xuất bản trước khi gửi duyệt hoặc xuất bản gói VOD',
        );
      }
    }

    const item = await this.prisma.vodPackage.update({
      where: { id },
      data: {
        code: data.code,
        title: data.title,
        price: data.price,
        discountPrice: data.discountPrice,
        status: data.status as any,
        rejectionReason: data.rejectionReason,
        instructorId: data.instructorId,
        thumbnailUrl: data.thumbnailUrl,
        submittedForApprovalAt:
          data.status === 'PENDING_APPROVAL' ? new Date() : undefined,
      },
    });

    if (
      requesterId &&
      data.status !== undefined &&
      data.status !== before.status
    ) {
      const action =
        data.status === 'PUBLISHED' && before.status === 'PENDING_APPROVAL'
          ? 'APPROVE'
          : data.status === 'DRAFT' && before.status === 'PENDING_APPROVAL'
            ? 'REJECT'
            : 'UPDATE_STATUS';
      await this.audit.log({
        userId: requesterId,
        action,
        entity: 'VodPackage',
        entityId: id,
        description: `${action} VOD package ${before.code}`,
        oldValues: { status: before.status },
        newValues: { status: item.status },
        metadata:
          action === 'REJECT'
            ? { reason: data.rejectionReason }
            : undefined,
      });
    }

    if (
      before.status === 'PENDING_APPROVAL' &&
      item.status === 'DRAFT' &&
      requesterId
    ) {
      try {
        const recipientId = await this.resolveRejectRecipient(id, requesterId);
        if (recipientId && recipientId !== requesterId) {
          this.notifyRejected({
            recipientId,
            packageId: item.id,
            packageCode: item.code,
            packageTitle: item.title,
            reason: data.rejectionReason ?? null,
          });
        }
      } catch (error: any) {
        this.logger.warn(
          `Failed to send reject notification for VOD package ${id}: ${error?.message || String(error)}`,
        );
      }
    }

    return item;
  }

  async delete(id: string) {
    await this.prisma.vodPackage.delete({ where: { id } });
    return { ok: true };
  }
}
