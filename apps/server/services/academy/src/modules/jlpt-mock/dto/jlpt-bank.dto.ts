import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export enum JlptBankDifficultyDto {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum JlptBankQuestionTypeDto {
  VOCAB = 'VOCAB',
  GRAMMAR = 'GRAMMAR',
  READING = 'READING',
  LISTENING = 'LISTENING',
}

export enum JlptBankSectionCodeDto {
  LANGUAGE_VOCAB = 'LANGUAGE_VOCAB',
  LANGUAGE_GRAMMAR_READING = 'LANGUAGE_GRAMMAR_READING',
  LISTENING = 'LISTENING',
}

export class JlptBankQuestionQueryDto {
  @IsOptional()
  @IsString()
  level?: string; // N5..N1

  @IsOptional()
  @IsEnum(JlptBankSectionCodeDto)
  sectionCode?: JlptBankSectionCodeDto;

  @IsOptional()
  @IsString()
  mondaiCode?: string;

  @IsOptional()
  @IsEnum(JlptBankQuestionTypeDto)
  questionType?: JlptBankQuestionTypeDto;

  @IsOptional()
  @IsEnum(JlptBankDifficultyDto)
  difficulty?: JlptBankDifficultyDto;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  take?: number;
}

export class JlptBankOptionInputDto {
  @IsString()
  @MaxLength(4)
  key!: string; // A/B/C/D

  @IsString()
  contentText!: string;

  @IsOptional()
  isCorrect?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}

export class JlptBankQuestionCreateDto {
  @IsEnum(JlptBankQuestionTypeDto)
  questionType!: JlptBankQuestionTypeDto;

  @IsEnum(JlptBankSectionCodeDto)
  sectionCode!: JlptBankSectionCodeDto;

  @IsString()
  level!: string; // N5..N1

  @IsOptional()
  @IsString()
  mondaiCode?: string;

  @IsString()
  stemText!: string;

  @IsOptional()
  @IsString()
  contextText?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsEnum(JlptBankDifficultyDto)
  difficulty?: JlptBankDifficultyDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JlptBankOptionInputDto)
  options!: JlptBankOptionInputDto[];
}

export class JlptBankQuestionUpdateDto {
  @IsOptional()
  @IsEnum(JlptBankQuestionTypeDto)
  questionType?: JlptBankQuestionTypeDto;

  @IsOptional()
  @IsEnum(JlptBankSectionCodeDto)
  sectionCode?: JlptBankSectionCodeDto;

  @IsOptional()
  @IsString()
  mondaiCode?: string;

  @IsOptional()
  @IsString()
  stemText?: string;

  @IsOptional()
  @IsString()
  contextText?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsEnum(JlptBankDifficultyDto)
  difficulty?: JlptBankDifficultyDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JlptBankOptionInputDto)
  options?: JlptBankOptionInputDto[];
}
