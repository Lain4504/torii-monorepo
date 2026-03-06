import { IsString, IsOptional, IsArray, IsObject, IsBoolean, IsNumber } from 'class-validator';

export class CreateDeckDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    subject?: string;

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
    imageUrl?: string;

    @IsString()
    @IsOptional()
    audioUrl?: string;

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

export class ReviewFlashcardDto {
    @IsNumber()
    quality: number; // 0 (Forgot) | 1 (Remembered)
}

export class ConvertNoteToFlashcardDto {
    @IsString()
    deckId: string;
}
