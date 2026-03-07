import { IsString, IsOptional, IsArray, IsObject, IsBoolean, IsNumber } from 'class-validator';

export class CreateDeckDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;
}

export class UpdateDeckDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;
}

export class CreateFlashcardDto {
    @IsString()
    term: string;

    @IsString()
    definition: string;

    @IsString()
    @IsOptional()
    hint?: string;

    @IsString()
    @IsOptional()
    mediaUrl?: string;

    @IsObject()
    @IsOptional()
    languageDetails?: Record<string, any>;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    tags?: string[];

    @IsString()
    @IsOptional()
    noteId?: string;
}

export class UpdateFlashcardDto {
    @IsString()
    @IsOptional()
    term?: string;

    @IsString()
    @IsOptional()
    definition?: string;

    @IsString()
    @IsOptional()
    hint?: string;

    @IsString()
    @IsOptional()
    mediaUrl?: string;

    @IsObject()
    @IsOptional()
    languageDetails?: Record<string, any>;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    tags?: string[];
}

export class ReviewFlashcardDto {
    @IsNumber()
    quality: number; // 0 (Forgot) | 1 (Remembered)
}

export class ConvertNoteToFlashcardDto {
    @IsString()
    deckId: string;
}
