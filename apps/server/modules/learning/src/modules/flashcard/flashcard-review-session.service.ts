import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';
import {
  StartReviewSessionDTO,
  CompleteReviewSessionDTO,
  ReviewSessionResponseDTO,
  ReviewQuality,
  FlashcardState,
} from '@workspace/schemas';

@Injectable()
export class FlashcardReviewSessionService {
  private readonly logger = new Logger(FlashcardReviewSessionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Start a new review session
   */
  async startSession(userId: string, data: StartReviewSessionDTO): Promise<ReviewSessionResponseDTO> {
    try {
      const { deckId, studyMode = 'normal', deviceType } = data;

      // Verify deck ownership
      const deck = await this.prisma.flashcardDeck.findUnique({
        where: { id: deckId },
        select: {
          id: true,
          userId: true,
        },
      });

      if (!deck) {
        throw new RpcException({
          status: 404,
          message: 'Flashcard deck not found',
        });
      }

      if (deck.userId !== userId) {
        throw new RpcException({
          status: 403,
          message: 'You do not have permission to access this deck',
        });
      }

      // Create session
      const session = await this.prisma.flashcardReviewSession.create({
        data: {
          userId,
          deckId,
          startedAt: new Date(),
          studyMode,
          deviceType: deviceType || null,
        },
      });

      return this.mapToResponse(session);
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error(`Error starting review session: ${error.message}`, error.stack);
      throw new RpcException({
        status: 500,
        message: `Failed to start review session: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Complete a review session
   */
  async completeSession(
    userId: string,
    data: CompleteReviewSessionDTO,
  ): Promise<ReviewSessionResponseDTO> {
    try {
      const { sessionId, completedAt } = data;

      // Get session with reviews
      const session = await this.prisma.flashcardReviewSession.findUnique({
        where: { id: sessionId },
        include: {
          reviews: {
            select: {
              quality: true,
              timeSpent: true,
              newState: true,
            },
          },
        },
      });

      if (!session) {
        throw new RpcException({
          status: 404,
          message: 'Review session not found',
        });
      }

      if (session.userId !== userId) {
        throw new RpcException({
          status: 403,
          message: 'You do not have permission to access this session',
        });
      }

      if (session.completedAt) {
        throw new RpcException({
          status: 400,
          message: 'Session already completed',
        });
      }

      // Calculate statistics from reviews
      const reviews = session.reviews;
      const totalCards = reviews.length;
      
      const stats = {
        newCards: reviews.filter((r) => r.newState === FlashcardState.NEW).length,
        learningCards: reviews.filter((r) => r.newState === FlashcardState.LEARNING).length,
        reviewCards: reviews.filter((r) => r.newState === FlashcardState.REVIEW).length,
        correctCount: reviews.filter((r) => r.quality !== ReviewQuality.ZERO).length,
        incorrectCount: reviews.filter((r) => r.quality === ReviewQuality.ZERO).length,
        hardCount: reviews.filter((r) => r.quality === ReviewQuality.ONE).length,
        easyCount: reviews.filter((r) => 
          r.quality === ReviewQuality.THREE || r.quality === ReviewQuality.FOUR
        ).length,
      };

      // Calculate average response time
      const totalTime = reviews.reduce((sum, r) => sum + r.timeSpent, 0);
      const averageResponseTime = totalCards > 0 ? Math.round(totalTime / totalCards) : 0;

      // Calculate mastery score (percentage correct)
      const masteryScore = totalCards > 0 
        ? Math.round((stats.correctCount / totalCards) * 100) 
        : null;

      // Calculate duration
      const endTime = completedAt || new Date();
      const durationSeconds = Math.floor((endTime.getTime() - session.startedAt.getTime()) / 1000);

      // Update session
      const updatedSession = await this.prisma.flashcardReviewSession.update({
        where: { id: sessionId },
        data: {
          completedAt: endTime,
          durationSeconds,
          totalCards,
          newCards: stats.newCards,
          learningCards: stats.learningCards,
          reviewCards: stats.reviewCards,
          correctCount: stats.correctCount,
          incorrectCount: stats.incorrectCount,
          hardCount: stats.hardCount,
          easyCount: stats.easyCount,
          averageResponseTime,
          masteryScore: masteryScore !== null ? masteryScore : null,
        },
      });

      // Update deck statistics
      await this.prisma.flashcardDeck.update({
        where: { id: session.deckId },
        data: {
          lastStudiedAt: new Date(),
          totalStudyTime: {
            increment: durationSeconds,
          },
        },
      });

      return this.mapToResponse(updatedSession);
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error(`Error completing review session: ${error.message}`, error.stack);
      throw new RpcException({
        status: 500,
        message: `Failed to complete review session: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Get session by ID
   */
  async getSessionById(userId: string, sessionId: string): Promise<ReviewSessionResponseDTO> {
    try {
      const session = await this.prisma.flashcardReviewSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new RpcException({
          status: 404,
          message: 'Review session not found',
        });
      }

      if (session.userId !== userId) {
        throw new RpcException({
          status: 403,
          message: 'You do not have permission to access this session',
        });
      }

      return this.mapToResponse(session);
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error(`Error getting session: ${error.message}`, error.stack);
      throw new RpcException({
        status: 500,
        message: `Failed to get session: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Get recent sessions for a user
   */
  async getRecentSessions(
    userId: string,
    deckId?: string,
    limit: number = 10,
  ): Promise<ReviewSessionResponseDTO[]> {
    try {
      const whereClause: any = { userId };
      if (deckId) {
        whereClause.deckId = deckId;
      }

      const sessions = await this.prisma.flashcardReviewSession.findMany({
        where: whereClause,
        orderBy: { startedAt: 'desc' },
        take: limit,
      });

      return sessions.map((s) => this.mapToResponse(s));
    } catch (error: any) {
      this.logger.error(`Error getting recent sessions: ${error.message}`, error.stack);
      throw new RpcException({
        status: 500,
        message: `Failed to get recent sessions: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Map Prisma model to response DTO
   */
  private mapToResponse(session: any): ReviewSessionResponseDTO {
    return {
      id: session.id,
      userId: session.userId,
      deckId: session.deckId,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
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

