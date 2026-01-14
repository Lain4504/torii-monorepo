import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class GrammarCheckDto {
  @IsString()
  text: string;

  @IsUUID()
  userId: string;
}

export class TranslateDto {
  @IsString()
  text: string;

  @IsEnum(['ja', 'en'])
  from: string;

  @IsEnum(['ja', 'en'])
  to: string;

  @IsUUID()
  userId: string;
}

export class CreateFlashcardDto {
  @IsString()
  word: string;

  @IsString()
  meaning: string;

  @IsOptional()
  @IsString()
  example?: string;

  @IsUUID()
  userId: string;
}

export class GenerateDrillDto {
  @IsEnum(['grammar', 'vocabulary', 'kanji', 'particles'])
  drillType: string;

  @IsEnum(['N5', 'N4', 'N3', 'N2', 'N1'])
  level: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsUUID()
  userId: string;
}

export class SimulateConversationDto {
  @IsString()
  topic: string;

  @IsEnum(['N5', 'N4', 'N3', 'N2', 'N1'])
  level: string;

  @IsUUID()
  userId: string;
}

export class RecommendResourcesDto {
  @IsString()
  concept: string;

  @IsEnum(['N5', 'N4', 'N3', 'N2', 'N1'])
  level: string;

  @IsUUID()
  userId: string;
}
