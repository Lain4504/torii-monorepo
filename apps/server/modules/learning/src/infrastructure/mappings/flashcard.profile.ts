import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Flashcard } from '@prisma/generated';
import { FlashcardGenerationMethod } from '@workspace/schemas';
import type { FlashcardResponseDTO } from '@workspace/schemas';

/**
 * Flashcard AutoMapper Profile
 * Maps Flashcard entity (Prisma) to FlashcardResponseDTO
 */
@Injectable()
export class FlashcardProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper: Mapper) => {
            createMap<Flashcard, FlashcardResponseDTO>(
                mapper,
                'Flashcard',
                'FlashcardResponseDTO',
                forMember(
                    (dest) => dest.id,
                    mapFrom((src) => src.id),
                ),
                forMember(
                    (dest) => dest.deckId,
                    mapFrom((src) => src.deckId),
                ),
                forMember(
                    (dest) => dest.frontText,
                    mapFrom((src) => src.frontText),
                ),
                forMember(
                    (dest) => dest.backText,
                    mapFrom((src) => src.backText),
                ),
                forMember(
                    (dest) => dest.exampleSentence,
                    mapFrom((src) => src.exampleSentence || undefined),
                ),
                forMember(
                    (dest) => dest.pronunciation,
                    mapFrom((src) => src.pronunciation || undefined),
                ),
                forMember(
                    (dest) => dest.imageUrl,
                    mapFrom((src) => src.imageUrl || undefined),
                ),
                forMember(
                    (dest) => dest.audioUrl,
                    mapFrom((src) => src.audioUrl || undefined),
                ),
                forMember(
                    (dest) => dest.tags,
                    mapFrom((src) => (src.tags as string[]) || []),
                ),
                forMember(
                    (dest) => dest.difficulty,
                    mapFrom((src) => src.difficulty as any),
                ),
                // Japanese-specific fields
                forMember(
                    (dest) => dest.furigana,
                    mapFrom((src) => src.furigana || undefined),
                ),
                forMember(
                    (dest) => dest.kanji,
                    mapFrom((src) => src.kanji || undefined),
                ),
                forMember(
                    (dest) => dest.partOfSpeech,
                    mapFrom((src) => src.partOfSpeech || undefined),
                ),
                forMember(
                    (dest) => dest.wordJlptLevel,
                    mapFrom((src) => src.wordJlptLevel || undefined),
                ),
                forMember(
                    (dest) => dest.meanings,
                    mapFrom((src) => (src.meanings as string[]) || []),
                ),
                // AI Integration fields
                forMember(
                    (dest) => dest.aiGenerated,
                    mapFrom((src) => src.aiGenerated || false),
                ),
                forMember(
                    (dest) => dest.sourceDocumentId,
                    mapFrom((src) => src.sourceDocumentId || undefined),
                ),
                forMember(
                    (dest) => dest.generationMethod,
                    mapFrom((src) => (src.generationMethod as any) || FlashcardGenerationMethod.MANUAL),
                ),
                forMember(
                    (dest) => dest.generationMetadata,
                    mapFrom((src) => (src.generationMetadata as any) || {}),
                ),
                // Metadata
                forMember(
                    (dest) => dest.notes,
                    mapFrom((src) => src.notes || undefined),
                ),
                forMember(
                    (dest) => dest.isArchived,
                    mapFrom((src) => src.isArchived || false),
                ),
                // SRS / Review stats
                forMember(
                    (dest) => dest.nextReviewDate,
                    mapFrom((src) => src.nextReviewDate || undefined),
                ),
                forMember(
                    (dest) => dest.intervalDays,
                    mapFrom((src) => src.intervalDays || 0),
                ),
                forMember(
                    (dest) => dest.easeFactor,
                    mapFrom((src) => Number(src.easeFactor) || 2.5),
                ),
                forMember(
                    (dest) => dest.reviewCount,
                    mapFrom((src) => src.reviewCount || 0),
                ),
                forMember(
                    (dest) => dest.correctCount,
                    mapFrom((src) => src.correctCount || 0),
                ),
                forMember(
                    (dest) => dest.lastReviewDate,
                    mapFrom((src) => src.lastReviewDate || undefined),
                ),
                forMember(
                    (dest) => dest.timesStudied,
                    mapFrom((src) => src.timesStudied || 0),
                ),
                forMember(
                    (dest) => dest.createdAt,
                    mapFrom((src) => src.createdAt),
                ),
                forMember(
                    (dest) => dest.updatedAt,
                    mapFrom((src) => src.updatedAt),
                ),
            );
        };
    }
}
