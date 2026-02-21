import { Injectable, Logger, Inject } from "@nestjs/common";
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from "@server/shared";
import { FlashcardDifficulty, FlashcardGenerationMethod } from "@workspace/schemas";
import { SrsAlgorithmService } from '@server/learning/modules/flashcard/srs-algorithm.service';
import type {
    FlashcardCreateDTO,
    FlashcardUpdateDTO,
    FlashcardQueryDTO,
    FlashcardResponseDTO,
    PaginatedResponseDTO,
    BulkFlashcardOperationsDTO,
    BulkFlashcardOperationsResponseDTO,
} from "@workspace/schemas";
import { IFlashcardRepository, FLASHCARD_REPOSITORY_TOKEN } from "@server/learning/interfaces/repositories/i-flashcard.repository";
import { IFlashcardDeckRepository, FLASHCARD_DECK_REPOSITORY_TOKEN } from "@server/learning/interfaces/repositories/i-flashcard-deck.repository";
import { IFlashcardService } from "@server/learning/interfaces/services/i-flashcard.service";

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

import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FlashcardService implements IFlashcardService {
    private readonly logger = new Logger(FlashcardService.name);

    constructor(
        @Inject(FLASHCARD_REPOSITORY_TOKEN)
        private readonly flashcardRepository: IFlashcardRepository,
        @Inject(FLASHCARD_DECK_REPOSITORY_TOKEN)
        private readonly deckRepository: IFlashcardDeckRepository,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
        private readonly prisma: PrismaService, // Still used for complex multi-table ops like initial progress
        private readonly srsAlgorithm: SrsAlgorithmService,
    ) {
    }

    async generateFlashcardsFromAI(userId: string, deckId: string, topic: string, level: string): Promise<{ success: boolean; count: number }> {
        try {
            await this.verifyDeckOwnership(userId, deckId);

            const result = await firstValueFrom(
                this.natsClient.send('agents.sensei.createFlashcard', { userId, topic, level })
            );

            if (!result || !result.flashcards || !Array.isArray(result.flashcards)) {
                throw new Error('AI returned invalid flashcard data');
            }

            this.logger.log(`AI generated ${result.flashcards.length} flashcards for topic ${topic}`);

            let createdCount = 0;
            for (const card of result.flashcards) {
                try {
                    await this.createFlashcard({
                        userId,
                        deckId,
                        frontText: card.front,
                        backText: card.back,
                        difficulty: toDifficultyLevel(level),
                        wordJlptLevel: level.toUpperCase(), // Ensure uppercase
                        furigana: card.reading,
                        kanji: card.front, // AI usually puts Kanji in front
                        aiGenerated: true,
                        generationMethod: FlashcardGenerationMethod.AI_AUTO,
                        generationMetadata: { topic, method: 'sensei_create_flashcard' },
                        tags: ['ai-generated', topic, level]
                    });
                    createdCount++;
                } catch (e: any) {
                    this.logger.warn(`Failed to create AI flashcard: ${e.message}`);
                }
            }

            return { success: true, count: createdCount };
        } catch (error: any) {
            this.logger.error(`Error generating flashcards from AI: ${error.message}`, error.stack);
            throw new RpcException({
                status: 500,
                message: `Failed to generate flashcards: ${error?.message || 'Unknown error'}`,
            });
        }
    }

    /**
     * Verify that a deck belongs to a specific user
     * Throws RpcException if not owned
     */
    private async verifyDeckOwnership(userId: string, deckId: string): Promise<void> {
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
                message: 'You do not have permission to access this flashcard deck',
            });
        }
    }

    async createFlashcard(
        params: FlashcardCreateDTO & { userId: string },
    ): Promise<FlashcardResponseDTO> {
        const { userId, ...data } = params;
        try {
            const { deckId } = data;

            // Verify deck ownership
            await this.verifyDeckOwnership(userId, deckId);

            // Create flashcard
            const flashcard = await this.flashcardRepository.create({
                deck: { connect: { id: deckId } },
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
                sourceDocument: (data as any).sourceDocumentId ? { connect: { id: (data as any).sourceDocumentId } } : undefined,
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
            });

            console.log('DEBUG: Flashcard created in DB:', JSON.stringify(flashcard, null, 2));
            const verify = await this.flashcardRepository.findById(flashcard.id);
            console.log('DEBUG: Verification flashcard findById result:', verify ? 'Found' : 'NOT FOUND');

            // Create initial user progress for card creator
            // Note: This is still done directly via prisma as it's a cross-table operation
            const initialValues = this.srsAlgorithm.getInitialValues();
            await this.prisma.flashcardUserProgress.create({
                data: {
                    user: { connect: { id: userId } },
                    flashcard: { connect: { id: flashcard.id } },
                    state: initialValues.state,
                    currentInterval: initialValues.currentInterval,
                    easeFactor: initialValues.easeFactor,
                    nextReviewDate: initialValues.nextReviewDate,
                }
            });

            // Update deck card count
            await this.deckRepository.update(deckId, {
                cardCount: {
                    increment: 1
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

    async getFlashcards(params: FlashcardQueryDTO & { userId: string }): Promise<PaginatedResponseDTO<FlashcardResponseDTO>> {
        const { userId, ...query } = params;
        try {
            const page = Number(query.page || 1);
            const limit = Number(query.limit || 10);
            const { deckId, search, tags, difficulty, jlptLevel } = query;
            const skip = (page - 1) * limit;
            const whereClause: any = {
                deck: {
                    userId: userId,
                },
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

                whereClause.deckId = deckId;
            }

            // Search by text
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

            // Filter by JLPT level
            if (jlptLevel) {
                whereClause.wordJlptLevel = jlptLevel;
            }

            // Filter out archived cards by default
            if (query.isArchived === undefined || !query.isArchived) {
                whereClause.isArchived = false;
            } else if (query.isArchived) {
                whereClause.isArchived = true;
            }

            const [total, flashcards] = await Promise.all([
                this.flashcardRepository.count(whereClause),
                this.flashcardRepository.findAll({
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
        params: FlashcardUpdateDTO & { userId: string },
    ): Promise<FlashcardResponseDTO> {
        const { userId, ...data } = params;
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
            const existing = await this.flashcardRepository.findById(id);

            if (!existing) {
                throw new RpcException({
                    status: 404,
                    message: 'Flashcard not found',
                });
            }

            // Verify deck ownership
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

            // Update Japanese-specific fields
            if ((data as any).furigana !== undefined) updateData.furigana = (data as any).furigana;
            if ((data as any).kanji !== undefined) updateData.kanji = (data as any).kanji;
            if ((data as any).partOfSpeech !== undefined) updateData.partOfSpeech = (data as any).partOfSpeech;
            if ((data as any).wordJlptLevel !== undefined) updateData.wordJlptLevel = (data as any).wordJlptLevel;
            if ((data as any).meanings !== undefined) updateData.meanings = (data as any).meanings;
            if ((data as any).notes !== undefined) updateData.notes = (data as any).notes;
            if ((data as any).isArchived !== undefined) updateData.isArchived = (data as any).isArchived;

            const updated = await this.flashcardRepository.update(id, updateData);

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

    async deleteFlashcard(id: string): Promise<void> {
        try {
            // Get flashcard to update deck count
            const fc = await this.flashcardRepository.findById(id);
            if (fc) {
                await this.flashcardRepository.delete(id);
                // Update deck card count
                await this.deckRepository.update(fc.deckId, {
                    cardCount: {
                        decrement: 1
                    }
                });
            }
        } catch (error: any) {
            this.logger.error(`Error deleting flashcard: ${error.message}`, error.stack);
            throw new RpcException({
                status: 400,
                message: `Failed to delete flashcard: ${error?.message || 'Unknown error'}`,
            });
        }
    }

    async getFlashcardById(id: string): Promise<FlashcardResponseDTO> {
        try {
            const flashcard = await this.flashcardRepository.findById(id);

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

    async bulkOperations(data: BulkFlashcardOperationsDTO & { userId: string }): Promise<BulkFlashcardOperationsResponseDTO> {
        let successCount = 0;
        let failedCount = 0;
        const errorMessages: string[] = [];
        const userId = data.userId;

        // Handle Creates
        if (data.create && data.create.length > 0) {
            for (const item of data.create) {
                try {
                    await this.createFlashcard({ ...item, userId });
                    successCount++;
                } catch (error: any) {
                    failedCount++;
                    errorMessages.push(`Create failed: ${error.message}`);
                }
            }
        }

        // Handle Updates
        if (data.update && data.update.length > 0) {
            for (const item of data.update) {
                try {
                    await this.updateFlashcard({ ...item, userId });
                    successCount++;
                } catch (error: any) {
                    failedCount++;
                    errorMessages.push(`Update failed for ${item.id}: ${error.message}`);
                }
            }
        }

        // Handle Deletes
        if (data.delete && data.delete.length > 0) {
            for (const id of data.delete) {
                try {
                    await this.deleteFlashcard(id);
                    successCount++;
                } catch (error: any) {
                    failedCount++;
                    errorMessages.push(`Delete failed for ${id}: ${error.message}`);
                }
            }
        }

        return {
            successCount,
            failedCount,
            errorMessages
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

