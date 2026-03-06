import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class LearningProgressUpsertDto {
  @IsUUID()
  classId!: string;

  @IsUUID()
  userId!: string;

  @IsUUID()
  lessonId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string; // NOT_STARTED, IN_PROGRESS, COMPLETED

  @IsOptional()
  lastAccessedAt?: Date;

  @IsOptional()
  @IsInt()
  @Min(0)
  progressPercent?: number;
}

export class LearningProgressQueryDto {
  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class LearningProgressStatsDto {
  @IsUUID()
  userId!: string;
}

