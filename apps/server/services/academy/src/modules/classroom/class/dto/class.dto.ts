import {
  IsDateString,
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
  syllabusId?: string;

  @IsString()
  @MaxLength(150)
  code!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  mode!: 'VOD' | 'LIVE';

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  instructorId?: string;

  // LIVE timeline fields (optional for VOD)
  @IsOptional()
  @IsDateString()
  openingDate?: string;

  @IsOptional()
  @IsDateString()
  closingDate?: string;

  @IsOptional()
  @IsDateString()
  enrollmentOpenAt?: string;

  @IsOptional()
  @IsDateString()
  enrollmentCloseAt?: string;
}

export class ClassUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  syllabusId?: string;

  @IsOptional()
  @IsUUID()
  instructorId?: string;

  @IsOptional()
  @IsDateString()
  openingDate?: string;

  @IsOptional()
  @IsDateString()
  closingDate?: string;

  @IsOptional()
  @IsDateString()
  enrollmentOpenAt?: string;

  @IsOptional()
  @IsDateString()
  enrollmentCloseAt?: string;
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

// --- ClassAssignment DTOs ---

export class ClassAssignmentCreateDto {
  @IsUUID()
  classId!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  instructions!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleOverride?: string;

  @IsOptional()
  openAt?: Date;

  @IsOptional()
  deadline?: Date;
}

export class ClassAssignmentUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleOverride?: string;

  @IsOptional()
  openAt?: Date;

  @IsOptional()
  deadline?: Date;
}

// --- UserLessonProgress DTOs ---

export class MarkLessonCompleteDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  classId!: string;

  @IsUUID()
  lessonId!: string;
}
