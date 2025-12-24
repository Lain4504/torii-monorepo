import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  ValidateNested,
  IsObject,
  IsInt,
} from 'class-validator';
import { ApiResponseDto, PaginatedResponseDto } from '../common';

// Enums
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_BLANK = 'fill_blank',
  MATCHING = 'matching',
  ESSAY = 'essay',
}

export enum QuestionDifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum QuestionStatus {
  ACTIVE = 'active',
  REVIEW = 'review',
  ARCHIVED = 'archived',
}

export enum QuestionJlptLevel {
  N5 = 'N5',
  N4 = 'N4',
  N3 = 'N3',
  N2 = 'N2',
  N1 = 'N1',
}

// DTOs
export class QuestionBankDto {
  id: string;
  questionText: string;
  questionType: QuestionType;
  jlptLevel?: QuestionJlptLevel;
  category?: string;
  subcategory?: string;
  difficulty?: QuestionDifficultyLevel;
  options?: Record<string, string>; // { "A": "text", "B": "text" }
  correctAnswer?: string;
  explanation?: string;
  tags: string[];
  createdBy?: string;
  status: QuestionStatus;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateQuestionBankDto {
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsEnum(QuestionType)
  @IsNotEmpty()
  questionType: QuestionType;

  @IsEnum(QuestionJlptLevel)
  @IsOptional()
  jlptLevel?: QuestionJlptLevel;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsEnum(QuestionDifficultyLevel)
  @IsOptional()
  difficulty?: QuestionDifficultyLevel;

  @IsObject()
  @IsOptional()
  options?: Record<string, string>;

  @IsString()
  @IsOptional()
  correctAnswer?: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  createdBy?: string;
}

export class UpdateQuestionBankDto {
  @IsString()
  @IsOptional()
  questionText?: string;

  @IsEnum(QuestionType)
  @IsOptional()
  questionType?: QuestionType;

  @IsEnum(QuestionJlptLevel)
  @IsOptional()
  jlptLevel?: QuestionJlptLevel;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsEnum(QuestionDifficultyLevel)
  @IsOptional()
  difficulty?: QuestionDifficultyLevel;

  @IsObject()
  @IsOptional()
  options?: Record<string, string>;

  @IsString()
  @IsOptional()
  correctAnswer?: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsEnum(QuestionStatus)
  @IsOptional()
  status?: QuestionStatus;
}

export class QuestionBankQueryDto {
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

  @IsEnum(QuestionType)
  @IsOptional()
  questionType?: QuestionType;

  @IsEnum(QuestionJlptLevel)
  @IsOptional()
  jlptLevel?: QuestionJlptLevel;

  @IsEnum(QuestionDifficultyLevel)
  @IsOptional()
  difficulty?: QuestionDifficultyLevel;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(QuestionStatus)
  @IsOptional()
  status?: QuestionStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

// Request/Response DTOs
export class CreateQuestionBankRequestDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateQuestionBankDto)
  input: CreateQuestionBankDto;
}

export class CreateQuestionBankResponseDto extends ApiResponseDto<QuestionBankDto> {}

export class UpdateQuestionBankRequestDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpdateQuestionBankDto)
  input: UpdateQuestionBankDto;
}

export class UpdateQuestionBankResponseDto extends ApiResponseDto<QuestionBankDto> {}

export class DeleteQuestionBankRequestDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class DeleteQuestionBankResponseDto extends ApiResponseDto<boolean> {}

export class GetQuestionBankByIdRequestDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class GetQuestionBankByIdResponseDto extends ApiResponseDto<QuestionBankDto> {}

export class QuestionBankListResponseDto extends ApiResponseDto<
  PaginatedResponseDto<QuestionBankDto>
> {}
