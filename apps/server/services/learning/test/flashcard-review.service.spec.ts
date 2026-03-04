import { Test, TestingModule } from '@nestjs/testing';
import { FlashcardReviewService } from '@server/learning/modules/flashcard/flashcard-review.service';
import { FLASHCARD_REVIEW_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-flashcard-review.repository';
import { FLASHCARD_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-flashcard.repository';
import { FLASHCARD_DECK_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-flashcard-deck.repository';
import { SrsAlgorithmService } from '@server/learning/modules/flashcard/srs-algorithm.service';
import { PrismaService } from '@server/shared';
import { RpcException } from '@nestjs/microservices';
import { FlashcardState, ReviewQuality } from '@workspace/schemas';

describe('FlashcardReviewService', () => {
    let service: FlashcardReviewService;
    let reviewRepository: any;
    let flashcardRepository: any;
    let deckRepository: any;
    let srsAlgorithm: any;
    let natsClient: any;

    const mockFlashcard = { id: 'fc-1', deckId: 'deck-1' };
    const mockDeck = { id: 'deck-1', userId: 'user-1', srsSettings: {} };
    const mockProgress = {
        id: 'prog-1',
        userId: 'user-1',
        flashcardId: 'fc-1',
        state: FlashcardState.NEW,
        currentInterval: 0,
        easeFactor: 2.5,
        timesReviewed: 0,
        timesCorrect: 0,
        timesIncorrect: 0,
        consecutiveCorrect: 0,
        averageResponseTime: 0,
        reviewedToday: 0,
    };

    const mockReviewRepository = {
        findProgress: jest.fn(),
        createProgress: jest.fn(),
        updateProgress: jest.fn(),
        createReview: jest.fn(),
        findManyProgress: jest.fn(),
    };

    const mockFlashcardRepository = {
        findById: jest.fn(),
        update: jest.fn(),
    };

    const mockDeckRepository = {
        findById: jest.fn(),
    };

    const mockSrsAlgorithm = {
        getInitialValues: jest.fn().mockReturnValue({ state: FlashcardState.NEW, currentInterval: 0, easeFactor: 2.5, nextReviewDate: new Date() }),
        calculateNextReview: jest.fn().mockReturnValue({ newState: FlashcardState.LEARNING, newInterval: 1, newEaseFactor: 2.5, newNextReviewDate: new Date() }),
        isDue: jest.fn().mockReturnValue(true),
    };

    const mockNatsClient = {
        emit: jest.fn(),
    };

    const mockPrismaService = {};

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FlashcardReviewService,
                {
                    provide: FLASHCARD_REVIEW_REPOSITORY_TOKEN,
                    useValue: mockReviewRepository,
                },
                {
                    provide: FLASHCARD_REPOSITORY_TOKEN,
                    useValue: mockFlashcardRepository,
                },
                {
                    provide: FLASHCARD_DECK_REPOSITORY_TOKEN,
                    useValue: mockDeckRepository,
                },
                {
                    provide: SrsAlgorithmService,
                    useValue: mockSrsAlgorithm,
                },
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: 'NATS_SERVICE',
                    useValue: mockNatsClient,
                },
            ],
        }).compile();

        service = module.get<FlashcardReviewService>(FlashcardReviewService);
        reviewRepository = module.get(FLASHCARD_REVIEW_REPOSITORY_TOKEN);
        flashcardRepository = module.get(FLASHCARD_REPOSITORY_TOKEN);
        deckRepository = module.get(FLASHCARD_DECK_REPOSITORY_TOKEN);
        srsAlgorithm = module.get(SrsAlgorithmService);
        natsClient = module.get('NATS_SERVICE');

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('submitReview', () => {
        it('should submit review and update progress', async () => {
            mockFlashcardRepository.findById.mockResolvedValue(mockFlashcard);
            mockDeckRepository.findById.mockResolvedValue(mockDeck);
            mockReviewRepository.findProgress.mockResolvedValue(mockProgress);
            mockReviewRepository.updateProgress.mockResolvedValue({ ...mockProgress, timesReviewed: 1 });
            mockReviewRepository.createReview.mockResolvedValue({ id: 'rev-1', createdAt: new Date() });

            const result = await service.submitReview('user-1', {
                flashcardId: '00000000-0000-0000-0000-000000000000',
                quality: ReviewQuality.FOUR,
                timeSpent: 5000,
            });

            expect(result.id).toBe('rev-1');
            expect(reviewRepository.updateProgress).toHaveBeenCalled();
            expect(reviewRepository.createReview).toHaveBeenCalled();
            expect(natsClient.emit).toHaveBeenCalledWith('user.activity', expect.any(Object));
        });

        it('should throw RpcException if flashcard not found', async () => {
            mockFlashcardRepository.findById.mockResolvedValue(null);
            await expect(service.submitReview('user-1', {
                flashcardId: '00000000-0000-0000-0000-000000000000',
                quality: ReviewQuality.FOUR,
                timeSpent: 0
            }))
                .rejects.toThrow(RpcException);
        });
    });

    describe('getCardsDue', () => {
        it('should return cards due for review', async () => {
            mockReviewRepository.findManyProgress.mockResolvedValue([{
                flashcard: { ...mockFlashcard, deck: { id: 'deck-1', name: 'Deck' } },
                state: FlashcardState.LEARNING,
                currentInterval: 1,
                easeFactor: 2.5,
                nextReviewDate: new Date(),
            }]);

            const result = await service.getCardsDue('user-1', {
                limit: 10,
                includeNew: true
            });

            expect(result).toHaveLength(1);
            expect(result[0].isDue).toBe(true);
        });
    });
});
