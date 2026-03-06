import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class ClassScheduleCreateDto {
  @IsUUID()
  classId!: string;

  @IsInt()
  @Min(0)
  weekday!: number; // 0-6

  @IsString()
  @MaxLength(20)
  startTime!: string; // HH:mm

  @IsString()
  @MaxLength(20)
  endTime!: string; // HH:mm

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class ClassScheduleUpdateDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  weekday?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  startTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  endTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class ClassScheduleQueryDto {
  @IsOptional()
  @IsUUID()
  classId?: string;
}

