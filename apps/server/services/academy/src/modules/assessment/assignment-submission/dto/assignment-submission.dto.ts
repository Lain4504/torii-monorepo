import { IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class AssignmentSubmissionCreateDto {
  @IsUUID()
  classId!: string;

  @IsUUID()
  classAssessmentId!: string;

  @IsUUID()
  assignmentTemplateId!: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  content?: unknown;
}

export class AssignmentSubmissionUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @Min(0)
  score?: number;

  @IsOptional()
  content?: unknown;
}

export class AssignmentSubmissionQueryDto {
  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  classAssessmentId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}

