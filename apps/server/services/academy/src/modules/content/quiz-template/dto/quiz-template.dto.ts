import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class QuizTemplateCreateDto {
  @IsUUID()
  courseProfileId!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  questionPoolId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  defaultTimeLimitMinutes?: number;

  @IsInt()
  @Min(1)
  defaultMaxAttempts!: number;

  @IsOptional()
  @Min(0)
  @Max(100)
  defaultPassingScorePercent?: number;

  @IsOptional()
  settings?: unknown;
}

export class QuizTemplateUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  questionPoolId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  defaultTimeLimitMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  defaultMaxAttempts?: number;

  @IsOptional()
  @Min(0)
  @Max(100)
  defaultPassingScorePercent?: number;

  @IsOptional()
  settings?: unknown;
}

export class QuizTemplateQueryDto {
  @IsOptional()
  @IsUUID()
  courseProfileId?: string;
}

