import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';

export class TrackProgressDto {
  @IsString()
  userId: string;

  @IsString()
  activity: string;

  @IsOptional()
  @IsNumber()
  score?: number;
}

export class SuggestPathDto {
  @IsString()
  userId: string;
}

export class IdentifyWeaknessesDto {
  @IsString()
  userId: string;
}

export class PredictReadinessDto {
  @IsString()
  userId: string;

  @IsEnum(['N5', 'N4', 'N3', 'N2', 'N1'])
  level: string;
}

export class GenerateReportDto {
  @IsString()
  userId: string;

  @IsEnum(['daily', 'weekly', 'monthly', 'overall'])
  reportType: string;
}
