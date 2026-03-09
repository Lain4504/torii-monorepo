import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CourseProfileCreateDto {
  @IsString()
  @MaxLength(100)
  code!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  level?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  thumbnailUrl?: string;
}

export class CourseProfileUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  level?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  thumbnailUrl?: string;
}

export class CourseProfileQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  level?: string;
}

