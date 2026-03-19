import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

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
  price!: number;

  @IsOptional()
  @Min(0)
  salePrice?: number;

  @IsString()
  @MaxLength(10)
  currency!: string;

  @IsString()
  mode!: string; // VOD, LIVE

  @IsUUID()
  classId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string; // DRAFT, PUBLISHED, OPENING, ARCHIVED

  @IsOptional()
  @IsString()
  @MaxLength(20)
  type?: string; // COURSE, BUNDLE, SUBSCRIPTION
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
  price?: number;

  @IsOptional()
  @Min(0)
  salePrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsString()
  type?: string;
}

export class CourseOfferingQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  q?: string;

  /** VOD | LIVE */
  @IsOptional()
  @IsString()
  mode?: string;

  /** When true and mode=LIVE, only return offerings with at least one class in enrollment window */
  @IsOptional()
  hasEnrollableLiveClass?: boolean;
}
