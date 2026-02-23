import { Test, TestingModule } from '@nestjs/testing';
import { FlashcardReviewSessionService } from '@server/learning/modules/flashcard/flashcard-review-session.service';
import { FLASHCARD_REVIEW_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-flashcard-review.repository';
import { PrismaService } from '@server/shared';
import { RpcException } from '@nestjs/microservices';
import { FlashcardState, ReviewQuality } from '@workspace/schemas';

describe('FlashcardReviewSessionService', () => {
    let service: FlashcardReviewSessionService;
    let reviewRepository: any;
    let prisma: any;

    const mockSession = {
        id: 'sess-1',
        userId: 'user-1',
        deckId: 'deck-1',
        startedAt: new Date(),
        totalCards: 0,
        correctCount: 0,
        incorrectCount: 0,
        durationSeconds: 0,
    };

    const mockReviewRepository = {
        createSession: jest.fn(),
        findSessionById: jest.fn(),
        findReviews: jest.fn(),
        updateSession: jest.fn(),
        findManySessions: jest.fn(),
    };

    const mockPrismaService = {
        flashcardDeck: {
            update: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FlashcardReviewSessionService,
                {
                    provide: FLASHCARD_REVIEW_REPOSITORY_TOKEN,
                    useValue: mockReviewRepository,
                },
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<FlashcardReviewSessionService>(FlashcardReviewSessionService);
        reviewRepository = module.get(FLASHCARD_REVIEW_REPOSITORY_TOKEN);
        prisma = module.get(PrismaService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('startSession', () => {
        it('should create a new session', async () => {
            mockReviewRepository.createSession.mockResolvedValue(mockSession);

            const result = await service.startSession('user-1', {
                deckId: '00000000-0000-0000-0000-000000000000',
                studyMode: 'normal'
            });

            expect(result.id).toBe(mockSession.id);
            expect(reviewRepository.createSession).toHaveBeenCalled();
        });
    });

    describe('completeSession', () => {
        it('should complete session and update deck stats', async () => {
            mockReviewRepository.findSessionById.mockResolvedValue(mockSession);
            mockReviewRepository.findReviews.mockResolvedValue([
                { quality: ReviewQuality.FOUR, timeSpent: 10, previousState: FlashcardState.NEW },
                { quality: ReviewQuality.ZERO, timeSpent: 20, previousState: FlashcardState.LEARNING },
            ]);
            mockReviewRepository.updateSession.mockResolvedValue({ ...mockSession, completedAt: new Date() });

            const result = await service.completeSession('sess-1', 'user-1', { durationSeconds: 30 });

            expect(result.id).toBe(mockSession.id);
            expect(reviewRepository.updateSession).toHaveBeenCalled();
            expect(prisma.flashcardDeck.update).toHaveBeenCalled();
        });

        it('should throw RpcException if session not found', async () => {
            mockReviewRepository.findSessionById.mockResolvedValue(null);
            await expect(service.completeSession('sess-1', 'user-1', {}))
                .rejects.toThrow(RpcException);
        });

        it('should throw RpcException if session not owned by user', async () => {
            mockReviewRepository.findSessionById.mockResolvedValue({ ...mockSession, userId: 'other' });
            await expect(service.completeSession('sess-1', 'user-1', {}))
                .rejects.toThrow(RpcException);
        });
    });
});
