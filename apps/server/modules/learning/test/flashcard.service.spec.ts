import { Test, TestingModule } from '@nestjs/testing';
import { FlashcardService } from '@server/learning/modules/flashcard/flashcard.service';
import { FLASHCARD_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-flashcard.repository';
import { FLASHCARD_DECK_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-flashcard-deck.repository';
import { SrsAlgorithmService } from '@server/learning/modules/flashcard/srs-algorithm.service';
import { PrismaService } from '@server/shared';
import { getMapperToken } from '@automapper/nestjs';
import { RpcException } from '@nestjs/microservices';

describe('FlashcardService', () => {
    let service: FlashcardService;
    let flashcardRepository: any;
    let deckRepository: any;
    let prisma: any;
    let srsAlgorithm: any;
    let natsClient: any;
    let mapper: any;

    const mockDeck = {
        id: 'deck-1',
        userId: 'user-1',
        title: 'Test Deck',
        cardCount: 0,
    };

    const mockFlashcard = {
        id: 'fc-1',
        deckId: 'deck-1',
        frontText: 'Front',
        backText: 'Back',
    };

    const mockFlashcardRepository = {
        create: jest.fn(),
        findById: jest.fn(),
        count: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const mockDeckRepository = {
        findById: jest.fn(),
        update: jest.fn(),
    };

    const mockPrismaService = {
        flashcardUserProgress: {
            create: jest.fn(),
        },
    };

    const mockSrsAlgorithm = {
        getInitialValues: jest.fn().mockReturnValue({
            state: 'NEW',
            currentInterval: 0,
            easeFactor: 2.5,
            nextReviewDate: new Date(),
        }),
    };

    const mockNatsClient = {
        send: jest.fn(),
        emit: jest.fn(),
    };

    const mockMapper = {
        map: jest.fn().mockImplementation((val) => (val ? { ...val } : val)),
        mapArray: jest.fn().mockImplementation((arr) => arr.map(val => ({ ...val }))),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FlashcardService,
                {
                    provide: FLASHCARD_REPOSITORY_TOKEN,
                    useValue: mockFlashcardRepository,
                },
                {
                    provide: FLASHCARD_DECK_REPOSITORY_TOKEN,
                    useValue: mockDeckRepository,
                },
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: SrsAlgorithmService,
                    useValue: mockSrsAlgorithm,
                },
                {
                    provide: 'NATS_SERVICE',
                    useValue: mockNatsClient,
                },
                {
                    provide: getMapperToken(),
                    useValue: mockMapper,
                },
            ],
        }).compile();

        service = module.get<FlashcardService>(FlashcardService);
        flashcardRepository = module.get(FLASHCARD_REPOSITORY_TOKEN);
        deckRepository = module.get(FLASHCARD_DECK_REPOSITORY_TOKEN);
        prisma = module.get(PrismaService);
        srsAlgorithm = module.get(SrsAlgorithmService);
        natsClient = module.get('NATS_SERVICE');
        mapper = module.get(getMapperToken());

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createFlashcard', () => {
        it('should create flashcard and progress record', async () => {
            mockDeckRepository.findById.mockResolvedValue(mockDeck);
            mockFlashcardRepository.create.mockResolvedValue(mockFlashcard);
            mockFlashcardRepository.findById.mockResolvedValue(mockFlashcard);

            const result = await service.createFlashcard({
                userId: 'user-1',
                deckId: 'deck-1',
                frontText: 'Front',
                backText: 'Back',
            });

            expect(result.id).toBe(mockFlashcard.id);
            expect(flashcardRepository.create).toHaveBeenCalled();
            expect(prisma.flashcardUserProgress.create).toHaveBeenCalled();
            expect(deckRepository.update).toHaveBeenCalled();
        });

        it('should throw RpcException if deck not found', async () => {
            mockDeckRepository.findById.mockResolvedValue(null);
            await expect(service.createFlashcard({
                userId: 'user-1',
                deckId: 'deck-1',
                frontText: 'F',
                backText: 'B',
            })).rejects.toThrow(RpcException);
        });

        it('should throw RpcException if deck not owned by user', async () => {
            mockDeckRepository.findById.mockResolvedValue({ ...mockDeck, userId: 'other-user' });
            await expect(service.createFlashcard({
                userId: 'user-1',
                deckId: 'deck-1',
                frontText: 'F',
                backText: 'B',
            })).rejects.toThrow(RpcException);
        });
    });

    describe('getFlashcards', () => {
        it('should return paginated flashcards', async () => {
            mockFlashcardRepository.count.mockResolvedValue(1);
            mockFlashcardRepository.findAll.mockResolvedValue([mockFlashcard]);

            const result = await service.getFlashcards({ userId: 'user-1', page: 1, limit: 10 });

            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
        });
    });

    describe('deleteFlashcard', () => {
        it('should delete flashcard and update deck count', async () => {
            mockFlashcardRepository.findById.mockResolvedValue(mockFlashcard);
            await service.deleteFlashcard('fc-1');
            expect(flashcardRepository.delete).toHaveBeenCalledWith('fc-1');
            expect(deckRepository.update).toHaveBeenCalled();
        });
    });
});
