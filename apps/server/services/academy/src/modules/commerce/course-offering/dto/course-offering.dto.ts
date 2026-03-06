import { IsArray, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CourseOfferingCreateDto {
  @IsString()
  @MaxLength(150)
  code!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Min(0)
  originalPrice!: number;

  @IsString()
  @MaxLength(10)
  currency!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string; // DRAFT, ACTIVE, ARCHIVED

  @IsString()
  @MaxLength(20)
  type?: string; // COURSE, BUNDLE, SUBSCRIPTION

  @IsOptional()
  validFrom?: Date;

  @IsOptional()
  validTo?: Date;

  @IsOptional()
  metadata?: unknown;

  @IsOptional()
  @IsArray()
  classIds?: string[];
}

export class CourseOfferingUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Min(0)
  originalPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  validFrom?: Date;

  @IsOptional()
  validTo?: Date;

  @IsOptional()
  metadata?: unknown;
}

export class CourseOfferingQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  q?: string;
}

export class CourseOfferingSetClassesDto {
  @IsUUID()
  offeringId!: string;

  @IsArray()
  classIds!: string[];
}

