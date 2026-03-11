import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class EnrollmentCreateDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  classId!: string;

  @IsOptional()
  @IsUUID()
  offeringId?: string;

  @IsOptional()
  expiresAt?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsUUID()
  sourceOrderId?: string;
}

export class EnrollmentQueryDto {
  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  offeringId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
