import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';
import { SrsAlgorithmService, type SrsCalculationResult } from './srs-algorithm.service';
import {
  SubmitReviewDTO,
  FlashcardReviewResponseDTO,
  GetCardsDueDTO,
  CardDueResponseDTO,
  GetUserProgressDTO,
  UserProgressResponseDTO,
  ReviewQuality,
  FlashcardState,
} from '@workspace/schemas';

@Injectable()
export class FlashcardReviewService {
  private readonly logger = new Logger(FlashcardReviewService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly srsAlgorithm: SrsAlgorithmService,
  ) {}

  /**
   * Submit a review for a flashcard
   */
  async submitReview(userId: string, data: SubmitReviewDTO): Promise<FlashcardReviewResponseDTO> {
    try {
      const { flashcardId, quality, timeSpent = 0, userAnswer, sessionId } = data;

      // Get flashcard with deck info
      const flashcard = await this.prisma.flashcard.findUnique({
        where: { id: flashcardId },
        include: {
          deck: {
            select: {
              id: true,
              userId: true,
              srsSettings: true,
            },
          },
        },
      });

      if (!flashcard) {
        throw new RpcException({
          status: 404,
          message: 'Flashcard not found',
        });
      }

      // Verify deck ownership
      if (flashcard.deck.userId !== userId) {
        throw new RpcException({
          status: 403,
          message: 'You do not have permission to review this flashcard',
        });
      }

      // Get or create user progress
      let userProgress = await this.prisma.flashcardUserProgress.findUnique({
        where: {
          userId_flashcardId: {
            userId,
            flashcardId,
          },
        },
      });

      // Create user progress if it doesn't exist
      if (!userProgress) {
        const initial = this.srsAlgorithm.getInitialValues();
        userProgress = await this.prisma.flashcardUserProgress.create({
          data: {
            userId,
            flashcardId,
            state: initial.state,
            currentInterval: initial.currentInterval,
            easeFactor: initial.easeFactor,
            nextReviewDate: initial.nextReviewDate,
          },
        });
      }

      // Save previous values
      const previousInterval = userProgress.currentInterval;
      const previousEaseFactor = Number(userProgress.easeFactor);
      const previousState = userProgress.state as FlashcardState;

      // Calculate new values using SRS algorithm
      const srsConfig = (flashcard.deck.srsSettings as any) || {};
      const srsResult: SrsCalculationResult = this.srsAlgorithm.calculateNextReview(
        userProgress.currentInterval,
        previousEaseFactor,
        quality,
        previousState,
        srsConfig,
      );

      // Update daily review count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastReviewDate = userProgress.lastReviewDate
        ? new Date(userProgress.lastReviewDate)
        : null;
      lastReviewDate?.setHours(0, 0, 0, 0);

      const isSameDay = lastReviewDate && lastReviewDate.getTime() === today.getTime();
      const newReviewedToday = isSameDay ? userProgress.reviewedToday + 1 : 1;

      // Update statistics
      const wasCorrect = quality !== ReviewQuality.ZERO;
      const newTimesReviewed = userProgress.timesReviewed + 1;
      const newTimesCorrect = wasCorrect ? userProgress.timesCorrect + 1 : userProgress.timesCorrect;
      const newTimesIncorrect = wasCorrect
        ? userProgress.timesIncorrect
        : userProgress.timesIncorrect + 1;
      const newConsecutiveCorrect = wasCorrect
        ? userProgress.consecutiveCorrect + 1
        : 0;

      // Calculate average response time
      const totalTime = userProgress.averageResponseTime * (newTimesReviewed - 1) + timeSpent;
      const newAverageResponseTime = Math.round(totalTime / newTimesReviewed);

      // Update user progress
      const updatedProgress = await this.prisma.flashcardUserProgress.update({
        where: {
          userId_flashcardId: {
            userId,
            flashcardId,
          },
        },
        data: {
          state: srsResult.newState,
          currentInterval: srsResult.newInterval,
          easeFactor: srsResult.newEaseFactor,
          nextReviewDate: srsResult.newNextReviewDate,
          lastReviewedAt: new Date(),
          lastReviewDate: today,
          reviewedToday: newReviewedToday,
          timesReviewed: newTimesReviewed,
          timesCorrect: newTimesCorrect,
          timesIncorrect: newTimesIncorrect,
          consecutiveCorrect: newConsecutiveCorrect,
          averageResponseTime: newAverageResponseTime,
          lastResponseTime: timeSpent,
        },
      });

      // Create review record - enums match between Prisma and Zod
      const review = await this.prisma.flashcardReview.create({
        data: {
          userId,
          flashcardId,
          deckId: flashcard.deckId,
          sessionId: sessionId || null,
          quality: quality as any, // Enums match: ZERO, ONE, TWO, THREE, FOUR
          timeSpent,
          userAnswer: userAnswer || null,
          previousInterval,
          previousEaseFactor,
          previousState: previousState as any, // Enums match: new, learning, review, relearning
          newInterval: srsResult.newInterval,
          newEaseFactor: srsResult.newEaseFactor,
          newState: srsResult.newState as any, // Enums match
          newNextReviewDate: srsResult.newNextReviewDate,
          reviewDate: new Date(),
        },
      });

      // Update global flashcard stats (for compatibility/analytics)
      await this.prisma.flashcard.update({
        where: { id: flashcardId },
        data: {
          reviewCount: { increment: 1 },
          correctCount: wasCorrect ? { increment: 1 } : undefined,
          lastReviewDate: new Date(),
          timesStudied: { increment: 1 },
        },
      });

      return {
        id: review.id,
        flashcardId,
        userId,
        quality: quality, // No cast needed
        timeSpent,
        previousInterval,
        previousEaseFactor,
        previousState: previousState || null,
        newInterval: srsResult.newInterval,
        newEaseFactor: srsResult.newEaseFactor,
        newState: srsResult.newState,
        newNextReviewDate: srsResult.newNextReviewDate,
        updatedProgress: {
          timesReviewed: updatedProgress.timesReviewed,
          timesCorrect: updatedProgress.timesCorrect,
          timesIncorrect: updatedProgress.timesIncorrect,
          consecutiveCorrect: updatedProgress.consecutiveCorrect,
        },
        createdAt: review.createdAt,
      };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error(`Error submitting review: ${error.message}`, error.stack);
      throw new RpcException({
        status: 500,
        message: `Failed to submit review: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Get cards due for review
   */
  async getCardsDue(userId: string, query: GetCardsDueDTO): Promise<CardDueResponseDTO[]> {
    try {
      const { deckId, limit = 20, state, includeNew = true } = query;

      const whereClause: any = {
        userId,
        OR: [],
      };

      // Filter by deck if provided
      if (deckId) {
        // Verify deck ownership
        const deck = await this.prisma.flashcardDeck.findUnique({
          where: { id: deckId },
          select: { userId: true },
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

        whereClause.flashcard = {
          deckId,
        };
      }

      // Filter by state
      if (state) {
        whereClause.state = state;
      } else if (includeNew) {
        // Include new cards or cards due for review
        whereClause.OR = [
          { state: FlashcardState.NEW },
          {
            nextReviewDate: {
              lte: new Date(),
            },
          },
        ];
      } else {
        // Only cards due for review
        whereClause.OR = [
          {
            nextReviewDate: {
              lte: new Date(),
            },
          },
        ];
      }

      // Get user progress with flashcard
      const userProgressList = await this.prisma.flashcardUserProgress.findMany({
        where: whereClause,
        include: {
          flashcard: {
            include: {
              deck: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: [
          { nextReviewDate: 'asc' },
          { createdAt: 'asc' }, // New cards first if no review date
        ],
        take: limit,
      });

      return userProgressList.map((up) => ({
        flashcard: {
          id: up.flashcard.id,
          deckId: up.flashcard.deckId,
          frontText: up.flashcard.frontText,
          backText: up.flashcard.backText,
          exampleSentence: up.flashcard.exampleSentence,
          pronunciation: up.flashcard.pronunciation,
          imageUrl: up.flashcard.imageUrl,
          audioUrl: up.flashcard.audioUrl,
          furigana: up.flashcard.furigana,
          kanji: up.flashcard.kanji,
          partOfSpeech: up.flashcard.partOfSpeech,
          wordJlptLevel: up.flashcard.wordJlptLevel,
          meanings: up.flashcard.meanings,
          tags: up.flashcard.tags,
          deck: up.flashcard.deck,
        },
        userProgress: {
          state: up.state as FlashcardState,
          currentInterval: up.currentInterval,
          easeFactor: Number(up.easeFactor),
          nextReviewDate: up.nextReviewDate,
          timesReviewed: up.timesReviewed,
          timesCorrect: up.timesCorrect,
        },
        isDue: this.srsAlgorithm.isDue(up.nextReviewDate, true),
      }));
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error(`Error getting cards due: ${error.message}`, error.stack);
      throw new RpcException({
        status: 500,
        message: `Failed to get cards due: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Get user progress for a specific flashcard
   */
  async getUserProgress(userId: string, data: GetUserProgressDTO): Promise<UserProgressResponseDTO | null> {
    try {
      const { flashcardId } = data;

      // Verify flashcard exists and user has access
      const flashcard = await this.prisma.flashcard.findUnique({
        where: { id: flashcardId },
        include: {
          deck: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!flashcard) {
        throw new RpcException({
          status: 404,
          message: 'Flashcard not found',
        });
      }

      if (flashcard.deck.userId !== userId) {
        throw new RpcException({
          status: 403,
          message: 'You do not have permission to access this flashcard',
        });
      }

      // Get user progress
      const userProgress = await this.prisma.flashcardUserProgress.findUnique({
        where: {
          userId_flashcardId: {
            userId,
            flashcardId,
          },
        },
      });

      if (!userProgress) {
        // Return null if no progress exists yet (card not reviewed)
        return null;
      }

      return {
        id: userProgress.id,
        userId: userProgress.userId,
        flashcardId: userProgress.flashcardId,
        state: userProgress.state as string,
        currentInterval: userProgress.currentInterval,
        easeFactor: Number(userProgress.easeFactor),
        lastReviewedAt: userProgress.lastReviewedAt,
        nextReviewDate: userProgress.nextReviewDate,
        timesReviewed: userProgress.timesReviewed,
        timesCorrect: userProgress.timesCorrect,
        timesIncorrect: userProgress.timesIncorrect,
        consecutiveCorrect: userProgress.consecutiveCorrect,
        reviewedToday: userProgress.reviewedToday,
        averageResponseTime: userProgress.averageResponseTime,
        createdAt: userProgress.createdAt,
        updatedAt: userProgress.updatedAt,
      };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error(`Error getting user progress: ${error.message}`, error.stack);
      throw new RpcException({
        status: 500,
        message: `Failed to get user progress: ${error?.message || 'Unknown error'}`,
      });
    }
  }
}

