import { IsOptional, IsString, IsUUID, IsUrl, MaxLength } from 'class-validator';

export class LessonCreateDto {
  @IsUUID()
  courseProfileId!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(50)
  contentType!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  contentUrl?: string;

  @IsOptional()
  @IsString()
  contentBody?: string;

  @IsOptional()
  attachments?: unknown;

  @IsOptional()
  metadata?: unknown;
}

export class LessonUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  contentType?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  contentUrl?: string;

  @IsOptional()
  @IsString()
  contentBody?: string;

  @IsOptional()
  attachments?: unknown;

  @IsOptional()
  metadata?: unknown;
}

export class LessonQueryDto {
  @IsOptional()
  @IsUUID()
  courseProfileId?: string;

  @IsOptional()
  @IsString()
  q?: string;
}

