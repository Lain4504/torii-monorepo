import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { ClassMode } from '@prisma/generated';
import type { Prisma } from '@prisma/generated';

export type LiveClassCapacitySnapshot = {
  activeEnrollmentCount: number;
  maxStudents: number | null;
  spotsLeft: number | null;
  isFull: boolean;
};

@Injectable()
export class LiveClassCapacityService {
  constructor(private readonly prisma: PrismaService) {}

  async countActive(
    classId: string,
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<number> {
    return client.enrollment.count({
      where: { classId, status: 'ACTIVE' },
    });
  }

  /**
   * Chỉ cho LIVE + khi có maxStudents. Trả null nếu không áp dụng (VOD / không giới hạn).
   */
  async getPublicCapacity(classId: string): Promise<LiveClassCapacitySnapshot | null> {
    const klass = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { mode: true, maxStudents: true },
    });
    if (!klass || klass.mode !== ClassMode.LIVE) return null;
    const max = klass.maxStudents ?? null;
    if (max == null) return null;

    const activeEnrollmentCount = await this.countActive(classId);
    const spotsLeft = Math.max(0, max - activeEnrollmentCount);
    const isFull = activeEnrollmentCount >= max;
    return {
      activeEnrollmentCount,
      maxStudents: max,
      spotsLeft,
      isFull,
    };
  }

  /**
   * Gắn số liệu đăng ký LIVE (luôn có activeCount; max/spots/isFull khi có maxStudents).
   */
  async attachLiveEnrollmentSummary<
    T extends { id: string; mode: string; maxStudents?: number | null },
  >(
    classes: T[],
  ): Promise<
    Array<
      T & {
        liveEnrollment?: {
          activeEnrollmentCount: number;
          maxStudents: number | null;
          spotsLeft: number | null;
          isFull: boolean;
        };
      }
    >
  > {
    const liveIds = classes.filter((c) => c.mode === 'LIVE').map((c) => c.id);
    if (!liveIds.length) return classes as any;

    const grouped = await this.prisma.enrollment.groupBy({
      by: ['classId'],
      where: { classId: { in: liveIds }, status: 'ACTIVE' },
      _count: { id: true },
    });
    const countMap = new Map(grouped.map((g) => [g.classId, g._count.id]));

    return classes.map((c) => {
      if (c.mode !== 'LIVE') return c as any;
      const activeEnrollmentCount = countMap.get(c.id) ?? 0;
      const max = c.maxStudents ?? null;
      const spotsLeft =
        max == null ? null : Math.max(0, max - activeEnrollmentCount);
      const isFull = max != null && activeEnrollmentCount >= max;
      return {
        ...c,
        liveEnrollment: {
          activeEnrollmentCount,
          maxStudents: max,
          spotsLeft,
          isFull,
        },
      };
    }) as any;
  }

  /**
   * Trong transaction: khóa hàng lớp + kiểm tra còn chỗ (chỉ LIVE có maxStudents).
   */
  async assertRoomForOneMore(
    classId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const klass = await tx.class.findUnique({
      where: { id: classId },
      select: { mode: true, maxStudents: true },
    });
    if (!klass || klass.mode !== ClassMode.LIVE || klass.maxStudents == null) {
      return;
    }

    await tx.$executeRawUnsafe(
      'SELECT 1 FROM classroom_classes WHERE id = $1::uuid FOR UPDATE',
      classId,
    );

    const count = await tx.enrollment.count({
      where: { classId, status: 'ACTIVE' },
    });
    if (count >= klass.maxStudents) {
      throw new BadRequestException(
        `Lớp đã đủ ${klass.maxStudents} học viên. Vui lòng chọn lớp khác hoặc kỳ sau quay lại.`,
      );
    }
  }
}
