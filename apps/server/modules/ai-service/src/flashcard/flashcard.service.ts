import {
    BulkFlashcardOperationsRequestDto,
    BulkFlashcardOperationsResponseDto,
    CreateFlashcardRequestDto,
    CreateFlashcardResponseDto,
    DeleteFlashcardRequestDto,
    DeleteFlashcardResponseDto,
    DifficultyLevel,
    FindAllFlashcardsRequestDto,
    FlashcardViewListResponseDto,
    GetFlashcardByIdRequestDto,
    GetFlashcardByIdResponseDto,
    UpdateFlashcardRequestDto,
    UpdateFlashcardResponseDto
} from "@workspace/dtos";
import { PrismaService } from "@server/shared";

/**
 * Helper function to convert difficulty string to DifficultyLevel enum
 */
function toDifficultyLevel(difficulty: string): DifficultyLevel {
    switch (difficulty?.toLowerCase()) {
        case 'easy':
            return DifficultyLevel.EASY;
        case 'medium':
            return DifficultyLevel.MEDIUM;
        case 'hard':
            return DifficultyLevel.HARD;
        default:
            return DifficultyLevel.DIFFICULTY_UNSPECIFIED;
    }
}

/**
 * Helper function to convert DifficultyLevel enum to string for DB
 */
function fromDifficultyLevel(level: DifficultyLevel): string {
    switch (level) {
        case DifficultyLevel.EASY:
            return 'easy';
        case DifficultyLevel.MEDIUM:
            return 'medium';
        case DifficultyLevel.HARD:
            return 'hard';
        default:
            return 'medium'; // Default
    }
}

export class FlashcardService {
    constructor(private readonly prisma: PrismaService) {
    }

    async createFlashcard(data: CreateFlashcardRequestDto): Promise<CreateFlashcardResponseDto> {
        try {
            const { deckId } = data; // Only take deckId from request

            console.log(`[FlashcardService] Creating flashcard for deck ${deckId} (USING MOCK DATA)`);

            // Hardcoded Mock Data
            const mockFront = "Mock Front " + Date.now();
            const mockBack = "Mock Back " + Date.now();

            const flashcard = await this.prisma.flashcard.create({
                data: {
                    deckId: deckId,
                    frontText: mockFront,
                    backText: mockBack,
                    exampleSentence: "This is a mock example sentence.",
                    pronunciation: "Mock Pronunciation",
                    imageUrl: "https://via.placeholder.com/150",
                    tags: ["mock", "test"],
                    difficulty: "medium",
                    // Default SM-2 values
                    intervalDays: 1,
                    easeFactor: 2.5,
                    reviewCount: 0,
                    correctCount: 0,
                    nextReviewDate: null
                }
            });

            return {
                success: true,
                message: 'Flashcard created successfully (MOCK DATA SAVED TO DB)',
                error: '',
                data: this.mapToProto(flashcard)
            };
        } catch (error) {
            console.error(`[FlashcardService] Error creating flashcard: ${error.message}`, error);
            return {
                success: false,
                message: 'Failed to create flashcard',
                error: error?.message || 'Unknown error',
                data: null as any
            };
        }
    }

    async getFlashcards(params: FindAllFlashcardsRequestDto): Promise<FlashcardViewListResponseDto> {
        try {
            const { page = 1, limit = 10, deckId } = params;
            const skip = (page - 1) * limit;
            const whereClause: any = {};
            if (deckId) {
                whereClause.deckId = deckId;
            }

            const [total, flashcards] = await Promise.all([
                this.prisma.flashcard.count({ where: whereClause }),
                this.prisma.flashcard.findMany({
                    take: limit,
                    skip: skip,
                    where: whereClause,
                    orderBy: { createdAt: 'desc' },
                }),
            ]);

            return {
                success: true,
                message: `${flashcards.length} flashcard(s) retrieved successfully`,
                error: '',
                data: flashcards.map(fc => ({
                    id: fc.id,
                    deckId: fc.deckId,
                    frontText: fc.frontText,
                    backText: fc.backText.substring(0, 100), // Truncate for list view
                    tags: fc.tags,
                    difficulty: toDifficultyLevel(fc.difficulty), // Convert to enum
                    nextReviewDate: fc.nextReviewDate ? fc.nextReviewDate.toISOString().split('T')[0] : undefined, // Format: YYYY-MM-DD
                    reviewCount: fc.reviewCount,
                    intervalDays: fc.intervalDays,
                    easeFactor: Number(fc.easeFactor),
                    correctCount: fc.correctCount,
                    createdAt: fc.createdAt,
                    updatedAt: fc.updatedAt
                })),
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to retrieve flashcards',
                error: error?.message || 'An unexpected error occurred',
                data: [],
                meta: {
                    page: 0,
                    limit: 0,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false
                }
            };
        }
    }

    async updateFlashcard(data: UpdateFlashcardRequestDto): Promise<UpdateFlashcardResponseDto> {
        try {
            const {
                id,
                deckId,
                frontText,
                backText,
                exampleSentence,
                pronunciation,
                imageUrl,
                audioUrl,
                tags,
                difficulty
            } = data;

            // Check if exists
            const existing = await this.prisma.flashcard.findUnique({ where: { id } });
            if (!existing) {
                return {
                    success: false,
                    message: 'Flashcard not found',
                    error: `Flashcard with ID ${id} does not exist`,
                    data: null as any
                };
            }

            const updated = await this.prisma.flashcard.update({
                where: { id },
                data: {
                    deckId: deckId ?? undefined,
                    frontText: frontText ?? undefined,
                    backText: backText ?? undefined,
                    exampleSentence: exampleSentence ?? undefined,
                    pronunciation: pronunciation ?? undefined,
                    imageUrl: imageUrl ?? undefined,
                    audioUrl: audioUrl ?? undefined,
                    tags: tags ?? undefined,
                    difficulty: difficulty ? fromDifficultyLevel(difficulty) : undefined,
                }
            });

            return {
                success: true,
                message: 'Flashcard updated successfully',
                error: '',
                data: this.mapToProto(updated)
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to update flashcard',
                error: error?.message || 'Unknown error',
                data: null as any
            };
        }
    }

    async deleteFlashcard(data: DeleteFlashcardRequestDto): Promise<DeleteFlashcardResponseDto> {
        try {
            await this.prisma.flashcard.delete({
                where: { id: data.id }
            });

            return {
                success: true,
                message: 'Flashcard deleted successfully',
                error: '',
                data: null as any
            };
        } catch (error) {
            // Handle P2025 (Record to delete does not exist)
            if (error.code === 'P2025') {
                return {
                    success: false,
                    message: 'Flashcard not found',
                    error: `Flashcard with ID ${data.id} does not exist`,
                    data: null as any
                };
            }
            return {
                success: false,
                message: 'Failed to delete flashcard',
                error: error?.message || 'Unknown error',
                data: null as any
            };
        }
    }

    async getFlashcardById(req: GetFlashcardByIdRequestDto): Promise<GetFlashcardByIdResponseDto> {
        try {
            const flashcard = await this.prisma.flashcard.findUnique({
                where: { id: req.id }
            });

            if (!flashcard) {
                return {
                    success: false,
                    message: 'Flashcard not found',
                    error: `Flashcard with ID ${req.id} does not exist`,
                    data: null as any
                };
            }

            return {
                success: true,
                message: 'Flashcard retrieved successfully',
                error: '',
                data: this.mapToProto(flashcard)
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to get flashcard',
                error: error?.message || 'Unknown error',
                data: null as any
            };
        }
    }

    async bulkOperations(data: BulkFlashcardOperationsRequestDto): Promise<BulkFlashcardOperationsResponseDto> {
        // TODO: Implement bulk operations
        return {
            success: false,
            message: 'Not implemented',
            error: 'Bulk operations are not yet implemented',
            data: {
                successCount: 0,
                failedCount: 0,
                errorMessages: []
            }
        };
    }

    // Helper to map DB entity to Full Proto Message
    private mapToProto(fc: any): any {
        return {
            id: fc.id,
            deckId: fc.deckId,
            frontText: fc.frontText,
            backText: fc.backText,
            exampleSentence: fc.exampleSentence || undefined,
            pronunciation: fc.pronunciation || undefined,
            imageUrl: fc.imageUrl || undefined,
            audioUrl: fc.audioUrl || undefined,
            tags: fc.tags,
            difficulty: toDifficultyLevel(fc.difficulty),
            nextReviewDate: fc.nextReviewDate ? fc.nextReviewDate.toISOString().split('T')[0] : undefined,
            intervalDays: fc.intervalDays,
            easeFactor: Number(fc.easeFactor),
            reviewCount: fc.reviewCount,
            correctCount: fc.correctCount,
            createdAt: fc.createdAt,
            updatedAt: fc.updatedAt
        };
    }
}