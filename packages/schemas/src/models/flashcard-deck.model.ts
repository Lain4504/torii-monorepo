import { z } from 'zod';

export const flashcardDeckSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    name: z.string().min(1),
    description: z.string().optional(),
    jlptLevel: z.string().optional(),
    isPublic: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    cardCount: z.number().default(0),
    studiedCount: z.number().default(0),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type FlashcardDeck = z.infer<typeof flashcardDeckSchema>;
