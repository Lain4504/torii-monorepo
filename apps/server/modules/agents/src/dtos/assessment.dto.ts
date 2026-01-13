import {
  IsEnum,
  IsNumber,
  IsString,
  IsObject,
  Min,
  Max,
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
}

export class EvaluateTestDto {
  @IsString()
  testId: string;

  @IsObject()
  answers: Record<string, string>;
}

export class GetBenchmarkDto {
  @IsString()
  userId: string;

  @IsEnum(['N5', 'N4', 'N3', 'N2', 'N1'])
  level: string;
}

export class ScheduleTestDto {
  @IsString()
  userId: string;

  @IsEnum(['N5', 'N4', 'N3', 'N2', 'N1'])
  level: string;

  @IsString()
  date: string;
}
