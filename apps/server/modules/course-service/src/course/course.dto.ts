import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
  IsUrl,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum JlptLevel {
  N5 = 'N5',
  N4 = 'N4',
  N3 = 'N3',
  N2 = 'N2',
  N1 = 'N1',
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsEnum(JlptLevel)
  @IsNotEmpty()
  jlptLevel!: JlptLevel;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  previewVideoUrl?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discountPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  durationWeeks?: number;

  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  featured?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isFree?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsOptional()
  learningOutcomes?: any; // JSONB - will validate as object/array

  @IsOptional()
  requirements?: any; // JSONB - will validate as object/array

  @IsString()
  @IsOptional()
  createdBy?: string; // UUID - will be set from auth context
}

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsEnum(JlptLevel)
  @IsOptional()
  jlptLevel?: JlptLevel;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  previewVideoUrl?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discountPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  durationWeeks?: number;

  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  featured?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isFree?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsOptional()
  learningOutcomes?: any;

  @IsOptional()
  requirements?: any;
}

export class CourseQueryDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit: number = 10;

  @IsEnum(JlptLevel)
  @IsOptional()
  jlptLevel?: JlptLevel;

  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @IsString()
  @IsOptional()
  search?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  featured?: boolean;
}

export class UpdateCourseStatusDto {
  @IsEnum(CourseStatus)
  @IsNotEmpty()
  status!: CourseStatus;

  @IsString()
  @IsOptional()
  approvedBy?: string; // UUID - will be set from auth context
}
