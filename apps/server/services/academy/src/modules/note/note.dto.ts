import { IsString, IsOptional, IsArray, IsObject, IsUUID } from 'class-validator';

export class CreateNoteDto {
    @IsString()
    content: string;

    @IsUUID()
    @IsOptional()
    lessonId?: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    tags?: string[];

    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}

export class UpdateNoteDto {
    @IsString()
    @IsOptional()
    content?: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    tags?: string[];

    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}
