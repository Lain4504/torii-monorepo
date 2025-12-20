export enum DifficultyLevel {
    DIFFICULTY_UNSPECIFIED = 0,
    EASY = 1,
    MEDIUM = 2,
    HARD = 3
}

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsNumber, IsBoolean, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiResponseDto, PaginatedResponseDto } from '../common';

export class FlashcardDto {
    id: string;
    deckId: string;
    frontText: string;
    backText: string;
    exampleSentence?: string;
    pronunciation?: string;
    imageUrl?: string;
    audioUrl?: string;
    tags: string[];
    difficulty: DifficultyLevel;
    nextReviewDate?: string;
    intervalDays: number;
    easeFactor: number;
    reviewCount: number;
    correctCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export class CreateFlashcardRequestDto {
    @IsString()
    @IsNotEmpty()
    deckId: string;

    @IsString()
    @IsNotEmpty()
    frontText: string;

    @IsString()
    @IsNotEmpty()
    backText: string;

    @IsString()
    @IsOptional()
    exampleSentence?: string;

    @IsString()
    @IsOptional()
    pronunciation?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    audioUrl?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsEnum(DifficultyLevel)
    @IsOptional()
    difficulty?: DifficultyLevel;
}

export class CreateFlashcardResponseDto extends ApiResponseDto<FlashcardDto> { }

export class FindAllFlashcardsRequestDto {
    @IsNumber()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    page: number = 1;

    @IsNumber()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    limit: number = 10;

    @IsString()
    @IsOptional()
    deckId?: string;

    @IsString()
    @IsOptional()
    search?: string;

    @IsEnum(DifficultyLevel)
    @IsOptional()
    @Type(() => Number)
    difficulty?: DifficultyLevel;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsString()
    @IsOptional()
    jlptLevel?: string;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    dueForReview?: boolean;

    @IsString()
    @IsOptional()
    userId?: string;
}

export class FlashcardViewListResponseDto extends PaginatedResponseDto<FlashcardDto> { }

export class UpdateFlashcardRequestDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsOptional()
    deckId?: string;

    @IsString()
    @IsOptional()
    frontText?: string;

    @IsString()
    @IsOptional()
    backText?: string;

    @IsString()
    @IsOptional()
    exampleSentence?: string;

    @IsString()
    @IsOptional()
    pronunciation?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    audioUrl?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsEnum(DifficultyLevel)
    @IsOptional()
    difficulty?: DifficultyLevel;
}

export class UpdateFlashcardResponseDto extends ApiResponseDto<FlashcardDto> { }

export class DeleteFlashcardRequestDto {
    @IsString()
    @IsNotEmpty()
    id: string;
}

export class DeleteFlashcardResponseDto extends ApiResponseDto<void> { }

export class GetFlashcardByIdRequestDto {
    @IsString()
    @IsNotEmpty()
    id: string;
}

export class GetFlashcardByIdResponseDto extends ApiResponseDto<FlashcardDto> { }

export class BulkFlashcardOperationsRequestDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateFlashcardRequestDto)
    @IsOptional()
    create?: CreateFlashcardRequestDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateFlashcardRequestDto)
    @IsOptional()
    update?: UpdateFlashcardRequestDto[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    delete?: string[];
}

export class BulkFlashcardOperationsResponseDto extends ApiResponseDto<{
    successCount: number;
    failedCount: number;
    errorMessages: string[];
}> { }
