import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

// --- Class DTOs ---

export class ClassCreateDto {
  @IsUUID()
  courseProfileId!: string;

  @IsOptional()
  @IsUUID()
  termId?: string;

  @IsOptional()
  term?:
    | {
        termCode: string;
        openingDate: Date | string;
        closingDate: Date | string;
        enrollmentOpenAt?: Date | string;
        enrollmentCloseAt?: Date | string;
      }
    | undefined;

  @IsString()
  @MaxLength(50)
  code!: string;

  @IsString()
  @MaxLength(150)
  name!: string;

  @IsString()
  mode!: 'VOD' | 'LIVE';

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  instructorId?: string;

  /** LIVE: giới hạn số học viên ACTIVE; bỏ qua với VOD */
  @IsOptional()
  @IsInt()
  maxStudents?: number | null;
}

export class ClassUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  courseProfileId?: string;

  @IsOptional()
  @IsUUID()
  termId?: string;

  @IsOptional()
  @IsUUID()
  instructorId?: string;

  @IsOptional()
  @IsInt()
  maxStudents?: number | null;
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
  @IsUUID()
  instructorId?: string;

  @IsOptional()
  @IsString()
  q?: string;
}

export class ClassDuplicateDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsUUID()
  instructorId?: string;
}

// --- ClassAssignment DTOs ---
export class ClassAssignmentCreateDto {
  @IsUUID()
  classId!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString() // ISO Date
  openAt?: string;

  @IsOptional()
  @IsString() // ISO Date
  deadline?: string;
}

export class ClassAssignmentUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString() // ISO Date
  openAt?: string;

  @IsOptional()
  @IsString() // ISO Date
  deadline?: string;
}

// --- Lesson Progress DTOs ---
export class MarkLessonCompleteDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  classId!: string;

  @IsUUID()
  lessonId!: string;
}
