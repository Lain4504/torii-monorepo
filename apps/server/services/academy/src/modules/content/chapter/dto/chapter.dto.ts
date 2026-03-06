import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class ChapterCreateDto {
  @IsUUID()
  courseEditionId!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  orderIndex!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;
}

export class ChapterUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;
}

export class ChapterQueryDto {
  @IsOptional()
  @IsUUID()
  courseEditionId?: string;
}

export class ChapterReorderDto {
  @IsUUID()
  courseEditionId!: string;

  @IsUUID(undefined, { each: true })
  orderedIds!: string[];
}

