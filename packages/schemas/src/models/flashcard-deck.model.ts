import { z } from 'zod';

// SRS Settings schema (Anki-like)
export const srsSettingsSchema = z.object({
    newCardsPerDay: z.number().default(20),
    maxReviewsPerDay: z.number().default(200),
    easyBonus: z.number().default(1.3),
    intervalModifier: z.number().default(1.0),
    maximumInterval: z.number().default(36500), // ~100 years
});

export type SrsSettings = z.infer<typeof srsSettingsSchema>;

// AI Settings schema
export const aiSettingsSchema = z.object({
    autoGenerate: z.boolean().default(false),
    requireApproval: z.boolean().default(true),
    minConfidence: z.number().min(0).max(1).default(0.8),
    filters: z.array(z.string()).default([]), // e.g., ["jlptLevel", "partOfSpeech"]
});

export type AiSettings = z.infer<typeof aiSettingsSchema>;

// Main flashcard deck schema with improvements
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
    
    // SRS Settings (Anki-like)
    srsSettings: srsSettingsSchema.optional(),
    
    // AI Integration Settings
    aiSettings: aiSettingsSchema.optional(),
    sourceType: z.enum(['manual', 'ai_generated', 'imported', 'mixed']).optional().default('manual'),
    
    // Activity Tracking
    lastStudiedAt: z.date().optional(),
    totalStudyTime: z.number().default(0), // seconds
    masteryPercentage: z.number().min(0).max(100).optional(),
    
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type FlashcardDeck = z.infer<typeof flashcardDeckSchema>;
