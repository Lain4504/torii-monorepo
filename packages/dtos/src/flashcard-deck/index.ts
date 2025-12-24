import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiResponseDto, PaginatedResponseDto } from '../common';

export class FlashcardDeckDto {
  id: string;
  userId: string;
  name: string;
  description?: string;
  jlptLevel?: string;
  isPublic: boolean;
  tags: string[];
  cardCount: number;
  studiedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateFlashcardDeckDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  jlptLevel?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPublic?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class CreateFlashcardDeckResponseDto extends ApiResponseDto<FlashcardDeckDto> {}

export class UpdateFlashcardDeckDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  jlptLevel?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPublic?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdateFlashcardDeckResponseDto extends ApiResponseDto<FlashcardDeckDto> {}

export class FlashcardDeckQueryDto {
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
  search?: string;

  @IsString()
  @IsOptional()
  jlptLevel?: string;
}

export class FlashcardDeckListResponseDto extends PaginatedResponseDto<FlashcardDeckDto> {}

export class GetFlashcardDeckByIdRequestDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class GetFlashcardDeckByIdResponseDto extends ApiResponseDto<FlashcardDeckDto> {}

export class DeleteFlashcardDeckRequestDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class DeleteFlashcardDeckResponseDto extends ApiResponseDto<void> {}



