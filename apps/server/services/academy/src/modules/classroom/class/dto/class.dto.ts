import {
  IsBoolean,
  IsDate,
  IsEnum,
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
  syllabusId!: string;

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
  openingDate?: Date;

  @IsOptional()
  closingDate?: Date;

  @IsOptional()
  minStudents?: number;

  @IsOptional()
  @IsString()
  minStudentsEnforcement?: 'STRICT' | 'NOTIFY' | 'DISABLED';

  @IsOptional()
  @IsUUID()
  instructorId?: string;

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
  openingDate?: Date;

  @IsOptional()
  closingDate?: Date;

  @IsOptional()
  minStudents?: number;

  @IsOptional()
  @IsString()
  minStudentsEnforcement?: 'STRICT' | 'NOTIFY' | 'DISABLED';

  @IsOptional()
  @IsUUID()
  instructorId?: string;

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
  @IsUUID()
  syllabusId?: string;

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
  openingDate?: Date;

  @IsOptional()
  closingDate?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsUUID()
  instructorId?: string;
}

export class ClassModuleCreateDto {
  @IsUUID()
  classId!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsInt()
  orderIndex?: number;
}

export class ClassModuleUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsInt()
  orderIndex?: number;
}

export class ClassContentCreateDto {
  @IsUUID()
  moduleId!: string;

  @IsUUID()
  lessonId!: string;

  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsDate()
  openAt?: Date;

  @IsOptional()
  @IsDate()
  deadline?: Date;

  @IsOptional()
  @IsUUID()
  overrideQuizId?: string;

  @IsOptional()
  @IsUUID()
  overrideExamId?: string;

  @IsOptional()
  @IsUUID()
  overrideAssignmentId?: string;
}

export class ClassContentUpdateDto {
  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsDate()
  openAt?: Date;

  @IsOptional()
  @IsDate()
  deadline?: Date;

  @IsOptional()
  @IsUUID()
  overrideQuizId?: string;

  @IsOptional()
  @IsUUID()
  overrideExamId?: string;

  @IsOptional()
  @IsUUID()
  overrideAssignmentId?: string;
}
