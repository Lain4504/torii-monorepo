import { Injectable, Logger, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';
import {
  ReviewSessionResponseDTO,
  StartReviewSessionDTO,
} from '@workspace/schemas';
import {
  IFlashcardReviewRepository,
  FLASHCARD_REVIEW_REPOSITORY_TOKEN,
} from '@server/learning/interfaces/repositories/i-flashcard-review.repository';
import type { IFlashcardReviewSessionService } from '@server/learning/interfaces/services/i-flashcard-review-session.service';

@Injectable()
export class FlashcardReviewSessionService implements IFlashcardReviewSessionService {
  private readonly logger = new Logger(FlashcardReviewSessionService.name);

  constructor(
    @Inject(FLASHCARD_REVIEW_REPOSITORY_TOKEN)
    private readonly reviewRepository: IFlashcardReviewRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Start a review session
   */
  async startSession(
    userId: string,
    data: StartReviewSessionDTO,
  ): Promise<ReviewSessionResponseDTO> {
    try {
      const { deckId, studyMode = 'normal', deviceType } = data;

      // Auto-create user if not exists (defensive for microservices DB sync)
      await this.prisma.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: `user-${userId}@temp.com`,
          displayName: 'User',
          role: 'LEARNER' as any,
        },
        update: {},
      });

      // Simple stats initialization
      const session = await this.reviewRepository.createSession({
        user: { connect: { id: userId } },
        deck: { connect: { id: deckId } },
        studyMode,
        deviceType: deviceType || null,
        startedAt: new Date(),
        totalCards: 0,
        newCards: 0,
        learningCards: 0,
        reviewCards: 0,
        correctCount: 0,
        incorrectCount: 0,
        hardCount: 0,
        easyCount: 0,
        averageResponseTime: 0,
      });

      return this.mapToDTO(session);
    } catch (error: any) {
      this.logger.error(
        `Error starting session: ${error.message}`,
        error.stack,
      );
      throw new RpcException({
        status: 500,
        message: `Failed to start session: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Complete a review session
   */
  async completeSession(
    sessionId: string,
    userId: string,
    data: { durationSeconds?: number },
  ): Promise<ReviewSessionResponseDTO> {
    try {
      const session = await this.reviewRepository.findSessionById(sessionId);

      if (!session) {
        throw new RpcException({
          status: 404,
          message: 'Session not found',
        });
      }

      if (session.userId !== userId) {
        throw new RpcException({
          status: 403,
          message: 'You do not have permission to access this session',
        });
      }

      // Calculate aggregate statistics from reviews in this session
      const reviews = await this.reviewRepository.findReviews({ sessionId });

      const totalCards = reviews.length;
      const correctCount = reviews.filter((r) => r.quality !== 'ZERO').length;
      const incorrectCount = reviews.filter((r) => r.quality === 'ZERO').length;
      const hardCount = reviews.filter((r) => r.quality === 'ONE').length;
      const easyCount = reviews.filter((r) => r.quality === 'FOUR').length;

      const totalResponseTime = reviews.reduce(
        (sum, r) => sum + r.timeSpent,
        0,
      );
      const averageResponseTime =
        totalCards > 0 ? Math.round(totalResponseTime / totalCards) : 0;

      // Updated count by state
      const newCards = reviews.filter((r) => r.previousState === 'new').length;
      const learningCards = reviews.filter(
        (r) => r.previousState === 'learning',
      ).length;
      const reviewCards = reviews.filter(
        (r) => r.previousState === 'review',
      ).length;

      const updatedSession = await this.reviewRepository.updateSession(
        sessionId,
        {
          completedAt: new Date(),
          durationSeconds: data.durationSeconds || 0,
          totalCards,
          correctCount,
          incorrectCount,
          hardCount,
          easyCount,
          averageResponseTime,
          newCards,
          learningCards,
          reviewCards,
        },
      );

      // Update deck last studied at
      await this.prisma.flashcardDeck.update({
        where: { id: session.deckId },
        data: {
          lastStudiedAt: new Date(),
          totalStudyTime: { increment: data.durationSeconds || 0 },
          studiedCount: { increment: 1 },
        },
      });

      return this.mapToDTO(updatedSession);
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(
        `Error completing session: ${error.message}`,
        error.stack,
      );
      throw new RpcException({
        status: 500,
        message: `Failed to complete session: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Get session by ID
   */
  async getSessionById(
    sessionId: string,
    userId: string,
  ): Promise<ReviewSessionResponseDTO> {
    try {
      const session = await this.reviewRepository.findSessionById(sessionId);

      if (!session) {
        throw new RpcException({
          status: 404,
          message: 'Session not found',
        });
      }

      if (session.userId !== userId) {
        throw new RpcException({
          status: 403,
          message: 'You do not have permission to access this session',
        });
      }

      return this.mapToDTO(session);
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(`Error getting session: ${error.message}`, error.stack);
      throw new RpcException({
        status: 500,
        message: `Failed to get session: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Get recent sessions for a user/deck
   */
  async getRecentSessions(
    userId: string,
    deckId?: string,
    limit?: number,
  ): Promise<ReviewSessionResponseDTO[]> {
    try {
      const takeLimit = Number(limit || 10);
      const whereClause: any = { userId };
      if (deckId) whereClause.deckId = deckId;

      const sessions = await this.reviewRepository.findManySessions({
        where: whereClause,
        take: takeLimit,
        skip: 0,
        orderBy: { startedAt: 'desc' },
      });

      return sessions.map((s) => this.mapToDTO(s));
    } catch (error: any) {
      this.logger.error(
        `Error getting recent sessions: ${error.message}`,
        error.stack,
      );
      throw new RpcException({
        status: 500,
        message: `Failed to get recent sessions: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  private mapToDTO(session: any): ReviewSessionResponseDTO {
    return {
      id: session.id,
      userId: session.userId,
      deckId: session.deckId,
      startedAt: session.startedAt,
      completedAt: session.completedAt || null,
      durationSeconds: session.durationSeconds,
      totalCards: session.totalCards,
      newCards: session.newCards,
      learningCards: session.learningCards,
      reviewCards: session.reviewCards,
      correctCount: session.correctCount,
      incorrectCount: session.incorrectCount,
      hardCount: session.hardCount,
      easyCount: session.easyCount,
      averageResponseTime: session.averageResponseTime,
      masteryScore: session.masteryScore ? Number(session.masteryScore) : null,
      deviceType: session.deviceType,
      studyMode: session.studyMode,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
