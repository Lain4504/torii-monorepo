import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class ClassAssessmentCreateDto {
  @IsUUID()
  classId!: string;

  @IsString()
  @MaxLength(20)
  kind!: string; // QUIZ, ASSIGNMENT

  @IsOptional()
  @IsUUID()
  quizTemplateId?: string;

  @IsOptional()
  @IsUUID()
  assignmentTemplateId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleOverride?: string;

  @IsOptional()
  deadline?: Date;

  @IsOptional()
  @Min(0)
  weight?: number;

  @IsOptional()
  maxAttemptsOverride?: number;

  @IsOptional()
  timeLimitOverrideMinutes?: number;

  @IsOptional()
  @Min(0)
  maxScoreOverride?: number;

  @IsOptional()
  settings?: unknown;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;
}

export class ClassAssessmentUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleOverride?: string;

  @IsOptional()
  deadline?: Date;

  @IsOptional()
  @Min(0)
  weight?: number;

  @IsOptional()
  maxAttemptsOverride?: number;

  @IsOptional()
  timeLimitOverrideMinutes?: number;

  @IsOptional()
  @Min(0)
  maxScoreOverride?: number;

  @IsOptional()
  settings?: unknown;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;
}

export class ClassAssessmentQueryDto {
  @IsOptional()
  @IsUUID()
  classId?: string;
}

export class ClassAssessmentAttemptQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsBoolean()
  latestOnly?: boolean;
}

