import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsBoolean, IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum LessonContentType {
  VIDEO = 'video',
  ARTICLE = 'article',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
}

export class CreateLessonDto {
  @IsUUID()
  @IsNotEmpty()
  moduleId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsEnum(LessonContentType)
  @IsNotEmpty()
  contentType!: LessonContentType;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  videoDuration?: number; // seconds

  @IsString()
  @IsOptional()
  articleContent?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPreview?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isUnlocked?: boolean;

  @IsString()
  @IsOptional()
  createdBy?: string;
}

export class UpdateLessonDto {
  @IsUUID()
  @IsOptional()
  moduleId?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(LessonContentType)
  @IsOptional()
  contentType?: LessonContentType;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  videoDuration?: number;

  @IsString()
  @IsOptional()
  articleContent?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPreview?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isUnlocked?: boolean;

  @IsString()
  @IsOptional()
  updatedBy?: string;
}

export class LessonQueryDto {
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

  @IsUUID()
  @IsOptional()
  moduleId?: string;

  @IsEnum(LessonContentType)
  @IsOptional()
  contentType?: LessonContentType;

  @IsString()
  @IsOptional()
  search?: string;
}

export class UpdateLessonRequestDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ValidateNested()
  @Type(() => UpdateLessonDto)
  input!: UpdateLessonDto;
}

export class LessonResponseDto {
  id!: string;
  moduleId!: string;
  title!: string;
  contentType!: LessonContentType;
  videoUrl?: string;
  videoDuration?: number;
  articleContent?: string;
  order!: number;
  isPreview!: boolean;
  isUnlocked!: boolean;
  createdBy?: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
}
