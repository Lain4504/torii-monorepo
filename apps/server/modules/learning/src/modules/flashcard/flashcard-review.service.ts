import { Injectable, Logger, Inject } from '@nestjs/common';
import { RpcException, ClientProxy } from '@nestjs/microservices';
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
  UserActivityEvent,
} from '@workspace/schemas';
import { IFlashcardReviewRepository, FLASHCARD_REVIEW_REPOSITORY_TOKEN } from '../../interfaces/repositories/i-flashcard-review.repository';
import { IFlashcardRepository, FLASHCARD_REPOSITORY_TOKEN } from '../../interfaces/repositories/i-flashcard.repository';
import { IFlashcardDeckRepository, FLASHCARD_DECK_REPOSITORY_TOKEN } from '../../interfaces/repositories/i-flashcard-deck.repository';
import type { IFlashcardReviewService } from '../../interfaces/services/i-flashcard-review.service';

@Injectable()
export class FlashcardReviewService implements IFlashcardReviewService {
  private readonly logger = new Logger(FlashcardReviewService.name);

  constructor(
    @Inject(FLASHCARD_REVIEW_REPOSITORY_TOKEN)
    private readonly reviewRepository: IFlashcardReviewRepository,
    @Inject(FLASHCARD_REPOSITORY_TOKEN)
    private readonly flashcardRepository: IFlashcardRepository,
    @Inject(FLASHCARD_DECK_REPOSITORY_TOKEN)
    private readonly deckRepository: IFlashcardDeckRepository,
    private readonly prisma: PrismaService,
    private readonly srsAlgorithm: SrsAlgorithmService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  /**
   * Submit a review for a flashcard
   */
  async submitReview(userId: string, data: SubmitReviewDTO): Promise<FlashcardReviewResponseDTO> {
    try {
      const { flashcardId, quality, timeSpent = 0, userAnswer, sessionId } = data;

      // Get flashcard with deck info
      const flashcard = await this.flashcardRepository.findById(flashcardId);

      if (!flashcard) {
        throw new RpcException({
          status: 404,
          message: 'Flashcard not found',
        });
      }

      // Verify deck ownership
      const deck = await this.deckRepository.findById(flashcard.deckId);
      if (!deck || deck.userId !== userId) {
        throw new RpcException({
          status: 403,
          message: 'You do not have permission to review this flashcard',
        });
      }

      // Get or create user progress
      let userProgress = await this.reviewRepository.findProgress(userId, flashcardId);

      // Create user progress if it doesn't exist
      if (!userProgress) {
        const initial = this.srsAlgorithm.getInitialValues();
        userProgress = await this.reviewRepository.createProgress({
          user: { connect: { id: userId } },
          flashcard: { connect: { id: flashcardId } },
          state: initial.state,
          currentInterval: initial.currentInterval,
          easeFactor: initial.easeFactor,
          nextReviewDate: initial.nextReviewDate,
        });
      }

      // Save previous values
      const previousInterval = userProgress.currentInterval;
      const previousEaseFactor = Number(userProgress.easeFactor);
      const previousState = userProgress.state as FlashcardState;

      // Calculate new values using SRS algorithm
      const srsConfig = (deck.srsSettings as any) || {};
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
      const updatedProgress = await this.reviewRepository.updateProgress(userId, flashcardId, {
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
      });

      // Create review record
      const review = await this.reviewRepository.createReview({
        user: { connect: { id: userId } },
        flashcard: { connect: { id: flashcardId } },
        deck: { connect: { id: flashcard.deckId } },
        session: sessionId ? { connect: { id: sessionId } } : undefined,
        quality: quality as any,
        timeSpent,
        userAnswer: userAnswer || null,
        previousInterval,
        previousEaseFactor,
        previousState: previousState as any,
        newInterval: srsResult.newInterval,
        newEaseFactor: srsResult.newEaseFactor,
        newState: srsResult.newState as any,
        newNextReviewDate: srsResult.newNextReviewDate,
        reviewDate: new Date(),
      });

      // Update global flashcard stats
      await this.flashcardRepository.update(flashcardId, {
        reviewCount: { increment: 1 },
        correctCount: wasCorrect ? { increment: 1 } : undefined,
        lastReviewDate: new Date(),
        timesStudied: { increment: 1 },
      });

      // Emit activity event for XP gain
      try {
        const activityEvent: UserActivityEvent = {
          userId,
          activityType: 'FLASHCARD_REVIEW',
          meta: {
            flashcardId,
            deckId: flashcard.deckId,
            quality,
          },
          timestamp: new Date().toISOString(),
        };
        this.natsClient.emit('user.activity', activityEvent);
        this.logger.log(`Emitted FLASHCARD_REVIEW event for user ${userId}`);
      } catch (e) {
        this.logger.error('Failed to emit flashcard activity event', e);
      }

      return {
        id: review.id,
        flashcardId,
        userId,
        quality: quality,
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
      const limit = Number(query.limit || 20);
      const { deckId, state, includeNew = true } = query;

      const whereClause: any = {
        userId,
        OR: [],
      };

      // Filter by deck if provided
      if (deckId) {
        const deck = await this.deckRepository.findById(deckId);

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
        whereClause.OR = [
          { state: FlashcardState.NEW },
          {
            nextReviewDate: {
              lte: new Date(),
            },
          },
        ];
      } else {
        whereClause.OR = [
          {
            nextReviewDate: {
              lte: new Date(),
            },
          },
        ];
      }

      // Get user progress with flashcard
      const userProgressList = await this.reviewRepository.findManyProgress(whereClause, {
        take: limit,
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
      });

      return userProgressList.map((up: any) => ({
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
      const flashcard = await this.flashcardRepository.findById(flashcardId);

      if (!flashcard) {
        throw new RpcException({
          status: 404,
          message: 'Flashcard not found',
        });
      }

      const deck = await this.deckRepository.findById(flashcard.deckId);
      if (!deck || deck.userId !== userId) {
        throw new RpcException({
          status: 403,
          message: 'You do not have permission to access this flashcard',
        });
      }

      // Get user progress
      const userProgress = await this.reviewRepository.findProgress(userId, flashcardId);

      if (!userProgress) {
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
