import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';
import { UserRole } from '@workspace/schemas';
import type {
  FlashcardDeckCreateDTO,
  FlashcardDeckUpdateDTO,
  FlashcardDeckQueryDTO,
  FlashcardDeckResponseDTO,
  PaginatedResponseDTO,
} from '@workspace/schemas';


@Injectable()
export class FlashcardDeckService {
  private readonly logger = new Logger(FlashcardDeckService.name);

  constructor(private readonly prisma: PrismaService) { }

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
      tags: deck.tags,
      cardCount: deck.cardCount,
      studiedCount: deck.studiedCount,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    };
  }

  /**
   * Verify that a deck belongs to a specific user
   * Throws RpcException if not owned
   */
  async verifyDeckOwnership(userId: string, deckId: string): Promise<void> {
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

  /**
   * Create a new flashcard deck
   */
  async createDeck(
    userId: string,
    data: FlashcardDeckCreateDTO,
  ): Promise<FlashcardDeckResponseDTO> {
    try {

      // Auto-create user if not exists (user management not fully implemented yet)
      // This ensures foreign key constraint is satisfied
      await this.prisma.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: `user-${userId}@temp.com`, // Temporary email
          displayName: 'User', // Temporary name
          role: UserRole.LEARNER,
          // emailVerifiedAt: null (default) = pending
        },
        update: {}, // Don't update if user already exists
      });

      const deck = await this.prisma.flashcardDeck.create({
        data: {
          userId,
          name: data.name,
          description: data.description || null,
          jlptLevel: data.jlptLevel || null,
          isPublic: data.isPublic ?? false,
          tags: data.tags || [],
          cardCount: 0,
          studiedCount: 0,
        },
      });

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
    userId: string,
    query: FlashcardDeckQueryDTO,
  ): Promise<PaginatedResponseDTO<FlashcardDeckResponseDTO>> {
    try {
      const { page = 1, limit = 10, search, jlptLevel } = query;
      const skip = (page - 1) * limit;

      const whereClause: any = {
        userId, // Only get decks owned by the user
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
        this.prisma.flashcardDeck.count({ where: whereClause }),
        this.prisma.flashcardDeck.findMany({
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

  /**
   * Update a flashcard deck
   */
  async updateDeck(
    userId: string,
    deckId: string,
    data: FlashcardDeckUpdateDTO,
  ): Promise<FlashcardDeckResponseDTO> {
    try {
      // Verify ownership
      await this.verifyDeckOwnership(userId, deckId);

      // Build update data - only include fields that are provided
      const updateData: Record<string, any> = {};

      if (data.name !== undefined) {
        updateData.name = data.name;
      }

      if (data.description !== undefined) {
        updateData.description = data.description || null;
      }

      if (data.jlptLevel !== undefined) {
        updateData.jlptLevel = data.jlptLevel || null;
      }

      if (data.isPublic !== undefined) {
        updateData.isPublic = data.isPublic;
      }

      if (data.tags !== undefined) {
        updateData.tags = data.tags;
      }

      // Update the deck
      const deck = await this.prisma.flashcardDeck.update({
        where: { id: deckId },
        data: updateData,
      });

      this.logger.log(`Flashcard deck updated: ${deckId} by user ${userId}`);

      return this.toFlashcardDeckResponseDTO(deck);
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
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
    userId: string,
    data: { id: string },
  ): Promise<{ success: boolean }> {
    try {
      // Verify ownership
      await this.verifyDeckOwnership(userId, data.id);

      // Delete the deck (cascade will delete all flashcards)
      await this.prisma.flashcardDeck.delete({
        where: { id: data.id },
      });

      this.logger.log(`Flashcard deck deleted: ${data.id} by user ${userId}`);

      return { success: true };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error('Error deleting flashcard deck', error);
      throw new RpcException({
        status: 500,
        message: `Failed to delete flashcard deck: ${error?.message || 'Unknown error'}`,
      });
    }
  }
}

