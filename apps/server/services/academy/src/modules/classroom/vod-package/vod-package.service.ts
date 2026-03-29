import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  AcademyVodPackageCreateDTO,
  AcademyVodPackageUpdateDTO,
  AcademyVodPackageQueryDTO,
} from '@workspace/schemas';

@Injectable()
export class VodPackageService {
  constructor(private prisma: PrismaService) { }

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
        submittedForApprovalAt:
          data.status === 'PENDING_APPROVAL' ? new Date() : undefined,
      },
    });
  }

  async update(id: string, data: AcademyVodPackageUpdateDTO) {
    if (data.status === 'PUBLISHED' || data.status === 'PENDING_APPROVAL') {
      const pkg = await this.prisma.vodPackage.findUnique({
        where: { id },
        include: { courseProfile: { select: { status: true } } },
      });
      if (!pkg) throw new NotFoundException('VOD Package not found');
      if (pkg.courseProfile.status !== 'PUBLISHED') {
        throw new BadRequestException(
          'Hồ sơ nội dung (Course Profile) cần được xuất bản trước khi gửi duyệt hoặc xuất bản gói VOD',
        );
      }
    }

    return this.prisma.vodPackage.update({
      where: { id },
      data: {
        code: data.code,
        title: data.title,
        price: data.price,
        discountPrice: data.discountPrice,
        status: data.status as any,
        rejectionReason: data.rejectionReason,
        submittedForApprovalAt:
          data.status === 'PENDING_APPROVAL' ? new Date() : undefined,
      },
    });
  }

  async delete(id: string) {
    await this.prisma.vodPackage.delete({ where: { id } });
    return { ok: true };
  }
}
