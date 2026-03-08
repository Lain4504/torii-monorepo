import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CourseEditionCreateDto {
  @IsUUID()
  courseProfileId!: string;

  @IsString()
  @MaxLength(50)
  editionTag!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  syllabusSnapshot?: unknown;

  @IsOptional()
  @IsString()
  changelog?: string;
}

export class CourseEditionUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  editionTag?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  syllabusSnapshot?: unknown;

  @IsOptional()
  @IsString()
  changelog?: string;
}

export class CourseEditionQueryDto {
  @IsOptional()
  @IsUUID()
  courseProfileId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}

