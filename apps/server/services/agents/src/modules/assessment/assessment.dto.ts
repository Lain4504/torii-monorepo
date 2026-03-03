import {
  IsEnum,
  IsNumber,
  IsString,
  IsObject,
  Min,
  Max,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class GenerateTestDto {
  @IsEnum(['N5', 'N4', 'N3', 'N2', 'N1'])
  level: string;

  @IsEnum(['vocabulary', 'grammar', 'reading', 'listening'])
  type: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  questionCount: number;

  @IsUUID()
  userId: string;
}

export class EvaluateTestDto {
  @IsString()
  testId: string;

  @IsObject()
  answers: Record<string, string>;

  @IsUUID()
  userId: string;
}

export class GetBenchmarkDto {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  targetLevel?: string;
}

export class ScheduleTestDto {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  targetLevel?: string; // Allow either level or targetLevel

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  studySchedule?: string; // Optional study schedule
}
