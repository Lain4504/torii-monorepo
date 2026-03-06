import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { IAchievementsRepository } from '@server/gamification/interfaces/repositories';

@Injectable()
export class AchievementsRepository implements IAchievementsRepository {
  private readonly logger = new Logger(AchievementsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAllActive() {
    return this.prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
    });
  }

  async findByCode(code: string) {
    return this.prisma.achievement.findUnique({
      where: { code },
    });
  }

  async findUserAchievement(userId: string, achievementId: string) {
    return this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
    });
  }

  async upsertAchievement(code: string, data: any) {
    return this.prisma.achievement.upsert({
      where: { code },
      update: data,
      create: {
        code,
        ...data,
      },
    });
  }

  async upsertUserAchievement(
    userId: string,
    achievementId: string,
    data: any,
  ) {
    return this.prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
      update: data,
      create: {
        userId,
        achievementId,
        ...data,
      },
    });
  }
}
