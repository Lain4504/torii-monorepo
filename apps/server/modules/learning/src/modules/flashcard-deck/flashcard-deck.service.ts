import { Injectable, Logger, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { UserRole } from '@workspace/schemas';
import type {
  FlashcardDeckCreateDTO,
  FlashcardDeckUpdateDTO,
  FlashcardDeckQueryDTO,
  FlashcardDeckResponseDTO,
  PaginatedResponseDTO,
} from '@workspace/schemas';
import { IFlashcardDeckRepository, FLASHCARD_DECK_REPOSITORY_TOKEN } from '../../interfaces/repositories/i-flashcard-deck.repository';
import type { IFlashcardDeckService } from '../../interfaces/services/i-flashcard-deck.service';
import { PrismaService } from '@server/shared';

@Injectable()
export class FlashcardDeckService implements IFlashcardDeckService {
  private readonly logger = new Logger(FlashcardDeckService.name);

  constructor(
    @Inject(FLASHCARD_DECK_REPOSITORY_TOKEN)
    private readonly deckRepository: IFlashcardDeckRepository,
    private readonly prisma: PrismaService, // Keep for some direct operations if needed
  ) { }

  /**
   * Map FlashcardDeck entity to FlashcardDeckResponseDTO
   */
  private toFlashcardDeckResponseDTO(deck: any): FlashcardDeckResponseDTO {
    return {
      id: deck.id,
      userId: deck.userId,
      name: deck.name,
      description: deck.description || undefined,
      jlptLevel: deck.jlptLevel || undefined,
      isPublic: deck.isPublic,
      tags: deck.tags || [],
      cardCount: deck.cardCount,
      studiedCount: deck.studiedCount,
      srsSettings: deck.srsSettings || undefined,
      aiSettings: deck.aiSettings || undefined,
      sourceType: deck.sourceType || 'manual',
      lastStudiedAt: deck.lastStudiedAt || undefined,
      totalStudyTime: deck.totalStudyTime || 0,
      masteryPercentage: deck.masteryPercentage ? Number(deck.masteryPercentage) : undefined,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    };
  }

  /**
   * Verify that a deck belongs to a specific user
   * Throws RpcException if not owned
   */
  private async verifyDeckOwnership(userId: string, deckId: string): Promise<any> {
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

    return deck;
  }

  /**
   * Create a new flashcard deck
   */
  async createDeck(
    params: FlashcardDeckCreateDTO & { userId: string },
  ): Promise<FlashcardDeckResponseDTO> {
    const { userId, ...data } = params;
    try {
      // Auto-create user if not exists
      await this.prisma.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: `user-${userId}@temp.com`,
          displayName: 'User',
          role: UserRole.LEARNER,
        },
        update: {},
      });

      const deck = await this.deckRepository.create({
        user: { connect: { id: userId } },
        name: data.name,
        description: data.description || null,
        jlptLevel: data.jlptLevel || null,
        isPublic: data.isPublic ?? false,
        tags: data.tags || [],
        cardCount: 0,
        studiedCount: 0,
      });

      console.log('DEBUG [DeckService]: Flashcard deck created in DB:', JSON.stringify(deck, null, 2));
      const verify = await this.deckRepository.findById(deck.id);
      console.log('DEBUG [DeckService]: Verification findById result:', verify ? 'Found' : 'NOT FOUND');

      this.logger.log(`Flashcard deck created: ${deck.id} by user ${userId}`);

      return this.toFlashcardDeckResponseDTO(deck);
    } catch (error: any) {
      this.logger.error('Error creating flashcard deck', error);
      throw new RpcException({
        status: 400,
        message: `Failed to create flashcard deck: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Get all flashcard decks for a user
   */
  async findAllDecks(
    params: FlashcardDeckQueryDTO & { userId: string },
  ): Promise<PaginatedResponseDTO<FlashcardDeckResponseDTO>> {
    const { userId, ...query } = params;
    try {
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 10);
      const { search, jlptLevel } = query;
      const skip = (page - 1) * limit;

      const whereClause: any = {
        userId,
      };

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (jlptLevel) {
        whereClause.jlptLevel = jlptLevel;
      }

      const [total, decks] = await Promise.all([
        this.deckRepository.count(whereClause),
        this.deckRepository.findAll({
          take: limit,
          skip: skip,
          where: whereClause,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: decks.map((deck) => this.toFlashcardDeckResponseDTO(deck)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error('Error retrieving flashcard decks', error);
      throw new RpcException({
        status: 500,
        message: `Failed to retrieve flashcard decks: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  async findOneDeck(id: string, userId: string): Promise<FlashcardDeckResponseDTO> {
    const deck = await this.verifyDeckOwnership(userId, id);
    return this.toFlashcardDeckResponseDTO(deck);
  }

  /**
   * Update a flashcard deck
   */
  async updateDeck(
    deckId: string,
    data: FlashcardDeckUpdateDTO,
    userId: string,
  ): Promise<FlashcardDeckResponseDTO> {
    try {
      // Verify ownership
      await this.verifyDeckOwnership(userId, deckId);

      // Build update data
      const updateData: any = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.jlptLevel !== undefined) updateData.jlptLevel = data.jlptLevel || null;
      if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
      if (data.tags !== undefined) updateData.tags = data.tags;

      const deck = await this.deckRepository.update(deckId, updateData);

      this.logger.log(`Flashcard deck updated: ${deckId} by user ${userId}`);

      return this.toFlashcardDeckResponseDTO(deck);
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error('Error updating flashcard deck', error);
      throw new RpcException({
        status: 500,
        message: `Failed to update flashcard deck: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Delete a flashcard deck
   */
  async deleteDeck(
    id: string,
    userId: string,
  ): Promise<void> {
    try {
      // Verify ownership
      await this.verifyDeckOwnership(userId, id);

      // Delete the deck (cascade will delete all flashcards)
      await this.deckRepository.delete(id);

      this.logger.log(`Flashcard deck deleted: ${id} by user ${userId}`);
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error('Error deleting flashcard deck', error);
      throw new RpcException({
        status: 500,
        message: `Failed to delete flashcard deck: ${error?.message || 'Unknown error'}`,
      });
    }
  }
}
