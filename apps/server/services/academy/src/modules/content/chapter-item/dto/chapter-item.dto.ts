import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class ChapterItemCreateDto {
  @IsUUID()
  chapterId!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(50)
  kind!: string;

  @IsUUID()
  referenceId!: string;

  @IsInt()
  @Min(0)
  orderIndex!: number;

  @IsOptional()
  metadata?: unknown;
}

export class ChapterItemUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @IsOptional()
  metadata?: unknown;
}

export class ChapterItemQueryDto {
  @IsOptional()
  @IsUUID()
  chapterId?: string;
}

export class ChapterItemReorderDto {
  @IsUUID()
  chapterId!: string;

  @IsUUID(undefined, { each: true })
  orderedIds!: string[];
}

