import { z } from 'zod';
import { flashcardDeckSchema } from '../models/flashcard-deck.model';
import { paginatedResponseSchema } from './common.dto';

export const flashcardDeckCreateDTOSchema = flashcardDeckSchema.pick({
    name: true,
    description: true,
    jlptLevel: true,
    isPublic: true,
    tags: true,
}).partial({
    description: true,
    jlptLevel: true,
    isPublic: true,
    tags: true,
});

export type FlashcardDeckCreateDTO = z.infer<typeof flashcardDeckCreateDTOSchema>;

export const flashcardDeckUpdateDTOSchema = flashcardDeckCreateDTOSchema.partial();

export type FlashcardDeckUpdateDTO = z.infer<typeof flashcardDeckUpdateDTOSchema>;

export const flashcardDeckQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    jlptLevel: z.string().optional(),
});

export type FlashcardDeckQueryDTO = z.infer<typeof flashcardDeckQueryDTOSchema>;

export const flashcardDeckResponseDTOSchema = flashcardDeckSchema;

export type FlashcardDeckResponseDTO = z.infer<typeof flashcardDeckResponseDTOSchema>;

export const flashcardDeckPaginatedResponseSchema = paginatedResponseSchema(flashcardDeckResponseDTOSchema);

export type FlashcardDeckPaginatedResponse = z.infer<typeof flashcardDeckPaginatedResponseSchema>;
