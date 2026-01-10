import { Injectable, Logger } from "@nestjs/common";
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from "@server/shared";
import { FlashcardDifficulty, FlashcardGenerationMethod } from "@workspace/schemas";
import { SrsAlgorithmService } from './srs-algorithm.service';
import type {
    FlashcardCreateDTO,
    FlashcardUpdateDTO,
    FlashcardQueryDTO,
    FlashcardResponseDTO,
    PaginatedResponseDTO,
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

    constructor(
        private readonly prisma: PrismaService,
        private readonly srsAlgorithm: SrsAlgorithmService,
    ) {
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

            // Create flashcard
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
                    // Japanese-specific fields
                    furigana: (data as any).furigana || null,
                    kanji: (data as any).kanji || null,
                    partOfSpeech: (data as any).partOfSpeech || null,
                    wordJlptLevel: (data as any).wordJlptLevel || null,
                    meanings: (data as any).meanings || null,
                    // AI Integration fields
                    aiGenerated: (data as any).aiGenerated || false,
                    sourceDocumentId: (data as any).sourceDocumentId || null,
                    generationMethod: (data as any).generationMethod || FlashcardGenerationMethod.MANUAL,
                    generationMetadata: (data as any).generationMetadata || {},
                    // Metadata
                    notes: (data as any).notes || null,
                    isArchived: (data as any).isArchived || false,
                    // Global stats (for analytics)
                    intervalDays: 1,
                    easeFactor: 2.5,
                    reviewCount: 0,
                    correctCount: 0,
                    lastReviewDate: null,
                    timesStudied: 0,
                }
            });

            // Create initial user progress for card creator
            const initialValues = this.srsAlgorithm.getInitialValues();
            await this.prisma.flashcardUserProgress.create({
                data: {
                    userId,
                    flashcardId: flashcard.id,
                    state: initialValues.state,
                    currentInterval: initialValues.currentInterval,
                    easeFactor: initialValues.easeFactor,
                    nextReviewDate: initialValues.nextReviewDate,
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

    async getFlashcards(userId: string, params: FlashcardQueryDTO): Promise<PaginatedResponseDTO<FlashcardResponseDTO>> {
        try {
            const { page = 1, limit = 10, deckId, search, tags, difficulty, jlptLevel } = params;
            const skip = (page - 1) * limit;
            const whereClause: any = {
                deck: {
                    userId: userId, // Only flashcards from user's decks (personal flashcards)
                },
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

                whereClause.deckId = deckId;
            }

            // Search by text (front or back text)
            if (search) {
                whereClause.OR = [
                    { frontText: { contains: search, mode: 'insensitive' } },
                    { backText: { contains: search, mode: 'insensitive' } },
                    { exampleSentence: { contains: search, mode: 'insensitive' } },
                ];
            }

            // Filter by tags
            if (tags && tags.length > 0) {
                whereClause.tags = {
                    hasSome: tags,
                };
            }

            // Filter by difficulty
            if (difficulty !== undefined) {
                whereClause.difficulty = fromDifficultyLevel(difficulty);
            }

            // Filter by JLPT level (word level)
            if (jlptLevel) {
                whereClause.wordJlptLevel = jlptLevel;
            }

            // Filter out archived cards by default (unless explicitly requested)
            if (params.isArchived === undefined || !params.isArchived) {
                whereClause.isArchived = false;
            } else if (params.isArchived) {
                whereClause.isArchived = true;
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
            if (error instanceof RpcException) {
                throw error;
            }
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

            const updateData: any = {
                deckId: deckId ?? undefined,
                frontText: frontText ?? undefined,
                backText: backText ?? undefined,
                exampleSentence: exampleSentence ?? undefined,
                pronunciation: pronunciation ?? undefined,
                imageUrl: imageUrl ?? undefined,
                audioUrl: audioUrl ?? undefined,
                tags: tags ?? undefined,
                difficulty: difficulty !== undefined ? fromDifficultyLevel(difficulty) : undefined,
            };

            // Update Japanese-specific fields if provided
            if ((data as any).furigana !== undefined) updateData.furigana = (data as any).furigana;
            if ((data as any).kanji !== undefined) updateData.kanji = (data as any).kanji;
            if ((data as any).partOfSpeech !== undefined) updateData.partOfSpeech = (data as any).partOfSpeech;
            if ((data as any).wordJlptLevel !== undefined) updateData.wordJlptLevel = (data as any).wordJlptLevel;
            if ((data as any).meanings !== undefined) updateData.meanings = (data as any).meanings;
            if ((data as any).notes !== undefined) updateData.notes = (data as any).notes;
            if ((data as any).isArchived !== undefined) updateData.isArchived = (data as any).isArchived;

            const updated = await this.prisma.flashcard.update({
                where: { id },
                data: updateData,
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
            tags: fc.tags || [],
            difficulty: toDifficultyLevel(fc.difficulty),
            // Japanese-specific fields
            furigana: fc.furigana || undefined,
            kanji: fc.kanji || undefined,
            partOfSpeech: fc.partOfSpeech || undefined,
            wordJlptLevel: fc.wordJlptLevel || undefined,
            meanings: fc.meanings || [],
            // AI Integration fields
            aiGenerated: fc.aiGenerated || false,
            sourceDocumentId: fc.sourceDocumentId || undefined,
            generationMethod: fc.generationMethod || FlashcardGenerationMethod.MANUAL,
            generationMetadata: fc.generationMetadata || {},
            // Metadata
            notes: fc.notes || undefined,
            isArchived: fc.isArchived || false,
            // Global stats (for compatibility/analytics)
            nextReviewDate: fc.nextReviewDate || undefined,
            intervalDays: fc.intervalDays || 0,
            easeFactor: Number(fc.easeFactor) || 2.5,
            reviewCount: fc.reviewCount || 0,
            correctCount: fc.correctCount || 0,
            lastReviewDate: fc.lastReviewDate || undefined,
            timesStudied: fc.timesStudied || 0,
            createdAt: fc.createdAt,
            updatedAt: fc.updatedAt
        };
    }
}
