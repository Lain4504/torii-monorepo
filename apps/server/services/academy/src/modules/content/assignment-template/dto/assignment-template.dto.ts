import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class AssignmentTemplateCreateDto {
  @IsUUID()
  courseProfileId!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MaxLength(20)
  defaultType!: string;

  @IsOptional()
  @Min(0)
  defaultMaxScore?: number;

  @IsOptional()
  defaultRubric?: unknown;

  @IsOptional()
  defaultSubmissionSettings?: unknown;
}

export class AssignmentTemplateUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  defaultType?: string;

  @IsOptional()
  @Min(0)
  defaultMaxScore?: number;

  @IsOptional()
  defaultRubric?: unknown;

  @IsOptional()
  defaultSubmissionSettings?: unknown;
}

export class AssignmentTemplateQueryDto {
  @IsOptional()
  @IsUUID()
  courseProfileId?: string;
}

