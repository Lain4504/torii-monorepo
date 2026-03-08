import {
  IsInt,
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
  mode!: 'VOD' | 'LIVE';

  // --- Common optional ---
  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  settings?: unknown;

  // --- Live-only fields ---
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
  minStudents?: number;

  @IsOptional()
  @IsString()
  minStudentsEnforcement?: 'STRICT' | 'NOTIFY' | 'DISABLED';

  @IsOptional()
  @IsUUID()
  primaryTeacherId?: string;

  // --- Shared enrollment fields ---
  @IsOptional()
  enrollmentOpenAt?: Date;

  @IsOptional()
  enrollmentCloseAt?: Date;

  @IsOptional()
  maxStudents?: number;

  // --- VOD-only fields ---
  @IsOptional()
  @IsInt()
  defaultExpiresMonths?: number;
}

export class ClassUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  mode?: 'VOD' | 'LIVE';

  // --- Live fields ---
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
  minStudents?: number;

  @IsOptional()
  @IsString()
  minStudentsEnforcement?: 'STRICT' | 'NOTIFY' | 'DISABLED';

  @IsOptional()
  @IsUUID()
  primaryTeacherId?: string;

  // --- Shared enrollment fields ---
  @IsOptional()
  enrollmentOpenAt?: Date;

  @IsOptional()
  enrollmentCloseAt?: Date;

  @IsOptional()
  maxStudents?: number;

  // --- VOD-only fields ---
  @IsOptional()
  @IsInt()
  defaultExpiresMonths?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

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

export class ClassDuplicateDto {
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
  @IsString()
  @MaxLength(150)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}
