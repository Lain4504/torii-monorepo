import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateModuleDto {
  @IsUUID()
  @IsNotEmpty()
  courseId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  order?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  durationMinutes?: number;

  @IsString()
  @IsOptional()
  createdBy?: string;
}

export class UpdateModuleDto {
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  order?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  durationMinutes?: number;

  @IsString()
  @IsOptional()
  updatedBy?: string;
}

export class ModuleQueryDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit: number = 10;

  @IsUUID()
  @IsOptional()
  courseId?: string;

  @IsString()
  @IsOptional()
  search?: string;
}

export class UpdateModuleRequestDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ValidateNested()
  @Type(() => UpdateModuleDto)
  input!: UpdateModuleDto;
}

export class ModuleResponseDto {
  id!: string;
  courseId!: string;
  title!: string;
  description?: string;
  order!: number;
  durationMinutes?: number;
  createdBy?: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
}
