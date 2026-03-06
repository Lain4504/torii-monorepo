import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ActivityType } from '@workspace/schemas';
import type { IActivitiesService } from '@server/gamification/interfaces/services';
import type { IActivitiesRepository } from '@server/gamification/interfaces/repositories';
import { ACTIVITIES_REPOSITORY_TOKEN } from '@server/gamification/interfaces/repositories';
import {
  PROFILES_SERVICE_TOKEN,
  ACHIEVEMENTS_SERVICE_TOKEN,
} from '@server/gamification/interfaces/services';
import type {
  IProfilesService,
  IAchievementsService,
} from '@server/gamification/interfaces/services';

const XP_REWARDS: Record<string, number> = {
  LESSON_COMPLETE: 50,
  QUIZ_ANSWER: 10,
  VIDEO_WATCH: 20,
  REVIEW: 15,
  PRACTICE: 15,
  FLASHCARD_REVIEW: 5,
  EXAM_COMPLETE: 100,
  BLOG_CREATE: 20,
  COMMENT_CREATE: 10,
  LOGIN: 10,
};

@Injectable()
export class ActivitiesService implements IActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    @Inject(ACTIVITIES_REPOSITORY_TOKEN)
    private readonly activitiesRepository: IActivitiesRepository,
    @Inject(PROFILES_SERVICE_TOKEN)
    private readonly profilesService: IProfilesService,
    @Inject(ACHIEVEMENTS_SERVICE_TOKEN)
    private readonly achievementsService: IAchievementsService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  async recordActivity(
    userId: string,
    activityType: ActivityType,
    meta?: Record<string, any>,
  ): Promise<any> {
    const today = new Date().toISOString().split('T')[0];

    const existing = await this.activitiesRepository.findDailyActivity(
      userId,
      today,
      activityType,
    );

    if (!existing) {
      await this.activitiesRepository.createDailyActivity({
        userId,
        date: today,
        activityType: activityType as any,
        meta: meta || {},
      });
    }

    let xpGain = XP_REWARDS[activityType] || 0;
    if (activityType === 'QUIZ_ANSWER' && meta?.isCorrect === false) {
      xpGain = 2;
    }

    let gamification: any;
    if (xpGain > 0) {
      gamification = await this.profilesService.updateXP(
        userId,
        xpGain,
        activityType,
      );
    } else {
      gamification = await this.profilesService.getGamificationProfile(userId);
    }

    const streakResult = await this.profilesService.recordActivity(userId);

    if (streakResult.streakUpdated) {
      this.natsClient.emit('streak.updated', {
        userId,
        oldStreak: streakResult.oldStreak,
        newStreak: streakResult.newStreak,
        isMilestone: streakResult.isMilestone,
        timestamp: new Date().toISOString(),
      });

      if (streakResult.isMilestone) {
        await this.achievementsService.checkStreakAchievements(
          userId,
          streakResult.newStreak,
        );
      }
    }

    switch (activityType) {
      case 'LESSON_COMPLETE':
        await this.achievementsService.checkLessonAchievements(userId);
        if (meta?.courseCompleted) {
          await this.achievementsService.checkCourseAchievements(userId);
        }
        break;
      case 'QUIZ_ANSWER':
        if (meta?.score && meta?.jlptLevel) {
          await this.achievementsService.checkQuizAchievements(
            userId,
            meta.score,
            meta.jlptLevel,
          );
        }
        break;
      case 'FLASHCARD_REVIEW':
        await this.achievementsService.checkFlashcardAchievements(userId);
        break;
    }

    return {
      streakUpdated: streakResult.streakUpdated,
      currentStreak: streakResult.newStreak,
      xpGained: xpGain,
      totalXp: gamification?.totalXp || 0,
      level: gamification?.level || 1,
      currentXp: gamification?.currentXp || 0,
    };
  }

  async getHistory(
    userId: string,
    query: { page?: any; limit?: any; type?: any },
  ) {
    const page = parseInt((query.page as string) || '1', 10) || 1;
    const limit = parseInt((query.limit as string) || '10', 10) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.activitiesRepository.findHistory(
      userId,
      skip,
      limit,
      query.type,
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
