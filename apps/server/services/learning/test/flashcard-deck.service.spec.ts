import { Test, TestingModule } from '@nestjs/testing';
import { FlashcardDeckService } from '@server/learning/modules/flashcard-deck/flashcard-deck.service';
import { FLASHCARD_DECK_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-flashcard-deck.repository';
import { PrismaService } from '@server/shared';
import { getMapperToken } from '@automapper/nestjs';
import { RpcException } from '@nestjs/microservices';

describe('FlashcardDeckService', () => {
    let service: FlashcardDeckService;
    let deckRepository: any;
    let prisma: any;
    let mapper: any;

    const mockDeck = {
        id: 'deck-1',
        userId: 'user-1',
        name: 'My Deck',
        cardCount: 0,
    };

    const mockDeckRepository = {
        findById: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const mockPrismaService = {
        user: {
            upsert: jest.fn(),
        },
    };

    const mockMapper = {
        map: jest.fn().mockImplementation((val) => (val ? { ...val } : val)),
        mapArray: jest.fn().mockImplementation((arr) => arr.map(val => ({ ...val }))),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FlashcardDeckService,
                {
                    provide: FLASHCARD_DECK_REPOSITORY_TOKEN,
                    useValue: mockDeckRepository,
                },
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: getMapperToken(),
                    useValue: mockMapper,
                },
            ],
        }).compile();

        service = module.get<FlashcardDeckService>(FlashcardDeckService);
        deckRepository = module.get(FLASHCARD_DECK_REPOSITORY_TOKEN);
        prisma = module.get(PrismaService);
        mapper = module.get(getMapperToken());

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createDeck', () => {
        it('should create deck and upsert user', async () => {
            mockDeckRepository.create.mockResolvedValue(mockDeck);
            mockDeckRepository.findById.mockResolvedValue(mockDeck);

            const result = await service.createDeck({ userId: 'user-1', name: 'New Deck' });

            expect(result.id).toBe(mockDeck.id);
            expect(prisma.user.upsert).toHaveBeenCalled();
            expect(deckRepository.create).toHaveBeenCalled();
        });
    });

    describe('findAllDecks', () => {
        it('should return paginated decks', async () => {
            mockDeckRepository.count.mockResolvedValue(1);
            mockDeckRepository.findAll.mockResolvedValue([mockDeck]);

            const result = await service.findAllDecks({ userId: 'user-1', page: 1, limit: 10 });

            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
        });
    });

    describe('deleteDeck', () => {
        it('should delete deck if owned by user', async () => {
            mockDeckRepository.findById.mockResolvedValue(mockDeck);
            await service.deleteDeck('deck-1', 'user-1');
            expect(deckRepository.delete).toHaveBeenCalledWith('deck-1');
        });

        it('should throw RpcException if deck not owned', async () => {
            mockDeckRepository.findById.mockResolvedValue({ ...mockDeck, userId: 'other' });
            await expect(service.deleteDeck('deck-1', 'user-1')).rejects.toThrow(RpcException);
        });
    });
});
