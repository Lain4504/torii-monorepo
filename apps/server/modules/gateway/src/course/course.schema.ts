import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginatedResponseDto } from '@workspace/dtos';

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

export class Course {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  shortDescription?: string;

  @ApiProperty({ enum: JlptLevel })
  jlptLevel: JlptLevel;

  @ApiPropertyOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  previewVideoUrl?: string;

  @ApiProperty()
  price: number;

  @ApiPropertyOptional()
  discountPrice?: number;

  @ApiPropertyOptional()
  durationWeeks?: number;

  @ApiProperty()
  totalLessons: number;

  @ApiProperty()
  totalQuizzes: number;

  @ApiProperty()
  totalStudents: number;

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  totalReviews: number;

  @ApiProperty({ enum: CourseStatus })
  status: CourseStatus;

  @ApiProperty()
  featured: boolean;

  @ApiProperty()
  isFree: boolean;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiPropertyOptional()
  learningOutcomes?: any;

  @ApiPropertyOptional()
  requirements?: any;

  @ApiPropertyOptional()
  createdBy?: string;

  @ApiPropertyOptional()
  approvedBy?: string;

  @ApiPropertyOptional()
  approvedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt?: Date;
}

export class CreateCourseInput {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ enum: JlptLevel })
  @IsEnum(JlptLevel)
  @IsNotEmpty()
  jlptLevel: JlptLevel;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  previewVideoUrl?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discountPrice?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  durationWeeks?: number;

  @ApiPropertyOptional({ enum: CourseStatus })
  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  featured?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isFree?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  learningOutcomes?: any;

  @ApiPropertyOptional()
  @IsOptional()
  requirements?: any;
}

export class UpdateCourseInput {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional({ enum: JlptLevel })
  @IsEnum(JlptLevel)
  @IsOptional()
  jlptLevel?: JlptLevel;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  previewVideoUrl?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discountPrice?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  durationWeeks?: number;

  @ApiPropertyOptional({ enum: CourseStatus })
  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  featured?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isFree?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  learningOutcomes?: any;

  @ApiPropertyOptional()
  @IsOptional()
  requirements?: any;

  @ApiPropertyOptional()
  @IsOptional()
  approvedBy?: string;
}


export class CourseListResponse extends PaginatedResponseDto<Course> {}
