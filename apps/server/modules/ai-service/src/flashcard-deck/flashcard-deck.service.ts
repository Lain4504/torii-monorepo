import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';
import {
  CreateFlashcardDeckDto,
  CreateFlashcardDeckResponseDto,
  FlashcardDeckDto,
  FlashcardDeckListResponseDto,
  FlashcardDeckQueryDto,
  DeleteFlashcardDeckRequestDto,
  DeleteFlashcardDeckResponseDto,
} from '@workspace/dtos';

@Injectable()
export class FlashcardDeckService {
  private readonly logger = new Logger(FlashcardDeckService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Map FlashcardDeck entity to FlashcardDeckDto
   */
  private toFlashcardDeckDto(deck: any): FlashcardDeckDto {
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
    data: CreateFlashcardDeckDto,
  ): Promise<CreateFlashcardDeckResponseDto> {
    try {
      // Auto-create user if not exists (user management not fully implemented yet)
      // This ensures foreign key constraint is satisfied
      await this.prisma.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: `user-${userId}@temp.com`, // Temporary email, will be updated when user management is complete
          fullName: 'User', // Temporary name, will be updated when user management is complete
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

      return {
        success: true,
        message: 'Flashcard deck created successfully',
        error: '',
        data: this.toFlashcardDeckDto(deck),
      };
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
    query: FlashcardDeckQueryDto,
  ): Promise<FlashcardDeckListResponseDto> {
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
        success: true,
        message: `${decks.length} flashcard deck(s) retrieved successfully`,
        error: '',
        data: decks.map((deck) => this.toFlashcardDeckDto(deck)),
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
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
   * Delete a flashcard deck
   */
  async deleteDeck(
    userId: string,
    data: DeleteFlashcardDeckRequestDto,
  ): Promise<DeleteFlashcardDeckResponseDto> {
    try {
      // Verify ownership
      await this.verifyDeckOwnership(userId, data.id);

      // Delete the deck (cascade will delete all flashcards)
      await this.prisma.flashcardDeck.delete({
        where: { id: data.id },
      });

      this.logger.log(`Flashcard deck deleted: ${data.id} by user ${userId}`);

      return {
        success: true,
        message: 'Flashcard deck deleted successfully',
        error: '',
        data: undefined,
      };
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

