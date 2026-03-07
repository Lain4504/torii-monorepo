import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class EnrollmentCreateDto {
  @IsUUID()
  classId!: string;

  @IsUUID()
  userId!: string;

  @IsOptional()
  expiresAt?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsUUID()
  sourceOfferingId?: string;

  @IsOptional()
  @IsUUID()
  sourceOrderId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  metadata?: unknown;
}

export class EnrollmentQueryDto {
  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

