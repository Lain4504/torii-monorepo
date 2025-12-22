import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import { JwtAuthGuard, CurrentUser } from '@server/shared';
import {
  CreateFlashcardDeckDto,
  CreateFlashcardDeckResponseDto,
  FlashcardDeckListResponseDto,
  FlashcardDeckQueryDto,
  DeleteFlashcardDeckResponseDto,
} from '@workspace/dtos';

@ApiTags('flashcard-decks')
@Controller('api/me/flashcard-decks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FlashcardDeckController {
  constructor(
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new flashcard deck' })
  @ApiResponse({ status: 201, description: 'Flashcard deck created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @CurrentUser() userId: string,
    @Body() input: CreateFlashcardDeckDto,
  ): Promise<CreateFlashcardDeckResponseDto> {
    try {
      const response = await lastValueFrom<CreateFlashcardDeckResponseDto>(
        this.natsClient.send(
          { cmd: 'flashcard-deck.create' },
          { userId, input },
        ),
      );
      return response;
    } catch (error: any) {
      console.error('Gateway: Error in flashcard-deck.create:', error);
      
      if (error?.error && typeof error.error === 'object') {
        const rpcError = error.error;
        if (rpcError.status && rpcError.message) {
          throw new HttpException(
            {
              success: false,
              message: rpcError.message,
              error: rpcError.message,
              data: null,
              statusCode: rpcError.status,
            },
            rpcError.status,
          );
        }
      }
      
      if (error?.message && error?.status) {
        throw new HttpException(
          {
            success: false,
            message: error.message,
            error: error.message,
            data: null,
            statusCode: error.status,
          },
          error.status,
        );
      }
      
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all flashcard decks for current user' })
  @ApiResponse({ status: 200, description: 'Return flashcard deck list' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'jlptLevel', required: false, type: String })
  async findAll(
    @CurrentUser() userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('jlptLevel') jlptLevel?: string,
  ): Promise<FlashcardDeckListResponseDto> {
    const query: FlashcardDeckQueryDto = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      ...(search && { search }),
      ...(jlptLevel && { jlptLevel: jlptLevel as string }),
    };

    const response = await lastValueFrom<FlashcardDeckListResponseDto>(
      this.natsClient.send(
        { cmd: 'flashcard-deck.findAll' },
        { userId, query },
      ),
    );

    return response;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a flashcard deck' })
  @ApiResponse({ status: 200, description: 'Flashcard deck deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not owner of deck' })
  @ApiResponse({ status: 404, description: 'Flashcard deck not found' })
  async delete(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<DeleteFlashcardDeckResponseDto> {
    try {
      const response = await lastValueFrom<DeleteFlashcardDeckResponseDto>(
        this.natsClient.send(
          { cmd: 'flashcard-deck.delete' },
          { userId, input: { id } },
        ),
      );
      return response;
    } catch (error: any) {
      console.error('Gateway: Error deleting flashcard deck:', error);
      
      if (error?.error && typeof error.error === 'object') {
        const rpcError = error.error;
        if (rpcError.status && rpcError.message) {
          throw new HttpException(
            {
              success: false,
              message: rpcError.message,
              error: rpcError.message,
              data: null,
              statusCode: rpcError.status,
            },
            rpcError.status,
          );
        }
      }
      
      if (error?.message && error?.status) {
        throw new HttpException(
          {
            success: false,
            message: error.message,
            error: error.message,
            data: null,
            statusCode: error.status,
          },
          error.status,
        );
      }
      
      throw error;
    }
  }
}

