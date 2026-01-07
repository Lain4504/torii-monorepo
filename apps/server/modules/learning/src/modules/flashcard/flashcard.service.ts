import { Injectable, Logger } from "@nestjs/common";
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from "@server/shared";
import { FlashcardDifficulty } from "@workspace/schemas";
import type {
    FlashcardCreateDTO,
    FlashcardUpdateDTO,
    FlashcardQueryDTO,
    FlashcardResponseDTO,
    FlashcardPaginatedResponse,
    BulkFlashcardOperationsDTO,
    BulkFlashcardOperationsResponseDTO,
} from "@workspace/schemas";

/**
 * Helper function to convert difficulty string to FlashcardDifficulty enum
 */
function toDifficultyLevel(difficulty: string): FlashcardDifficulty {
    switch (difficulty?.toLowerCase()) {
        case 'easy':
            return FlashcardDifficulty.EASY;
        case 'medium':
            return FlashcardDifficulty.MEDIUM;
        case 'hard':
            return FlashcardDifficulty.HARD;
        default:
            return FlashcardDifficulty.DIFFICULTY_UNSPECIFIED;
    }
}

/**
 * Helper function to convert FlashcardDifficulty enum to string for DB
 */
function fromDifficultyLevel(level: FlashcardDifficulty): string {
    switch (level) {
        case FlashcardDifficulty.EASY:
            return 'easy';
        case FlashcardDifficulty.MEDIUM:
            return 'medium';
        case FlashcardDifficulty.HARD:
            return 'hard';
        default:
            return 'medium'; // Default
    }
}

@Injectable()
export class FlashcardService {
    private readonly logger = new Logger(FlashcardService.name);

    constructor(private readonly prisma: PrismaService) {
    }

    /**
     * Verify that a deck belongs to a specific user
     * Throws RpcException if not owned
     */
    private async verifyDeckOwnership(userId: string, deckId: string): Promise<void> {
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
                message: 'You do not have permission to access this flashcard deck',
            });
        }
    }

    async createFlashcard(
        userId: string,
        data: FlashcardCreateDTO,
    ): Promise<FlashcardResponseDTO> {
        try {
            const { deckId } = data;

            // Verify deck ownership
            await this.verifyDeckOwnership(userId, deckId);

            const flashcard = await this.prisma.flashcard.create({
                data: {
                    deckId: deckId,
                    frontText: data.frontText,
                    backText: data.backText,
                    exampleSentence: data.exampleSentence || null,
                    pronunciation: data.pronunciation || null,
                    imageUrl: data.imageUrl || null,
                    audioUrl: data.audioUrl || null,
                    tags: data.tags || [],
                    difficulty: data.difficulty !== undefined ? fromDifficultyLevel(data.difficulty) : 'medium',
                    // Default SM-2 values
                    intervalDays: 1,
                    easeFactor: 2.5,
                    reviewCount: 0,
                    correctCount: 0,
                    nextReviewDate: null
                }
            });

            // Update deck card count
            await this.prisma.flashcardDeck.update({
                where: { id: deckId },
                data: {
                    cardCount: {
                        increment: 1
                    }
                }
            });

            return this.mapToProto(flashcard);
        } catch (error: any) {
            if (error instanceof RpcException) {
                throw error;
            }
            this.logger.error(`Error creating flashcard: ${error.message}`, error.stack);
            throw new RpcException({
                status: 400,
                message: `Failed to create flashcard: ${error?.message || 'Unknown error'}`,
            });
        }
    }

    async getFlashcards(params: FlashcardQueryDTO): Promise<FlashcardPaginatedResponse> {
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
                data: flashcards.map(fc => this.mapToProto(fc)),
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error: any) {
            this.logger.error(`Error getting flashcards: ${error.message}`, error.stack);
            throw new RpcException({
                status: 400,
                message: `Failed to retrieve flashcards: ${error?.message || 'Unknown error'}`,
            });
        }
    }

    async updateFlashcard(
        userId: string,
        data: FlashcardUpdateDTO,
    ): Promise<FlashcardResponseDTO> {
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

            // Check if flashcard exists
            const existing = await this.prisma.flashcard.findUnique({
                where: { id },
                include: { deck: { select: { userId: true } } }
            });

            if (!existing) {
                throw new RpcException({
                    status: 404,
                    message: 'Flashcard not found',
                });
            }

            // Verify deck ownership (use existing deck or new deckId if provided)
            const targetDeckId = deckId || existing.deckId;
            await this.verifyDeckOwnership(userId, targetDeckId);

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
                    difficulty: difficulty !== undefined ? fromDifficultyLevel(difficulty) : undefined,
                }
            });

            return this.mapToProto(updated);
        } catch (error: any) {
            if (error instanceof RpcException) {
                throw error;
            }
            this.logger.error(`Error updating flashcard: ${error.message}`, error.stack);
            throw new RpcException({
                status: 400,
                message: `Failed to update flashcard: ${error?.message || 'Unknown error'}`,
            });
        }
    }

    async deleteFlashcard(data: { id: string }): Promise<{ success: boolean }> {
        try {
            await this.prisma.flashcard.delete({
                where: { id: data.id }
            });

            return { success: true };
        } catch (error: any) {
            this.logger.error(`Error deleting flashcard: ${error.message}`, error.stack);
            throw new RpcException({
                status: 400,
                message: `Failed to delete flashcard: ${error?.message || 'Unknown error'}`,
            });
        }
    }

    async getFlashcardById(req: { id: string }): Promise<FlashcardResponseDTO> {
        try {
            const flashcard = await this.prisma.flashcard.findUnique({
                where: { id: req.id }
            });

            if (!flashcard) {
                throw new RpcException({
                    status: 404,
                    message: 'Flashcard not found',
                });
            }

            return this.mapToProto(flashcard);
        } catch (error: any) {
            if (error instanceof RpcException) throw error;
            this.logger.error(`Error getting flashcard by id: ${error.message}`, error.stack);
            throw new RpcException({
                status: 400,
                message: `Failed to get flashcard: ${error?.message || 'Unknown error'}`,
            });
        }
    }

    async bulkOperations(data: BulkFlashcardOperationsDTO): Promise<BulkFlashcardOperationsResponseDTO> {
        // TODO: Implement bulk operations
        return {
            successCount: 0,
            failedCount: 0,
            errorMessages: ['Not implemented']
        };
    }

    private mapToProto(fc: any): FlashcardResponseDTO {
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
            nextReviewDate: fc.nextReviewDate || undefined,
            intervalDays: fc.intervalDays,
            easeFactor: Number(fc.easeFactor),
            reviewCount: fc.reviewCount,
            correctCount: fc.correctCount,
            createdAt: fc.createdAt,
            updatedAt: fc.updatedAt
        };
    }
}
