import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class ClassCreateDto {
  @IsUUID()
  courseProfileId!: string;

  @IsUUID()
  courseEditionId!: string;

  @IsString()
  @MaxLength(150)
  code!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(20)
  mode!: string; // VOD, LIVE, BLENDED

  @IsOptional()
  @IsString()
  @MaxLength(100)
  term?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  batch?: string;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;

  @IsOptional()
  enrollmentOpenAt?: Date;

  @IsOptional()
  enrollmentCloseAt?: Date;

  @IsOptional()
  minStudents?: number;

  @IsOptional()
  maxStudents?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsUUID()
  primaryTeacherId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  settings?: unknown;
}

export class ClassUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  mode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  term?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  batch?: string;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;

  @IsOptional()
  enrollmentOpenAt?: Date;

  @IsOptional()
  enrollmentCloseAt?: Date;

  @IsOptional()
  minStudents?: number;

  @IsOptional()
  maxStudents?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsUUID()
  primaryTeacherId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  settings?: unknown;
}

export class ClassQueryDto {
  @IsOptional()
  @IsUUID()
  courseProfileId?: string;

  @IsOptional()
  @IsUUID()
  courseEditionId?: string;

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  q?: string;
}

