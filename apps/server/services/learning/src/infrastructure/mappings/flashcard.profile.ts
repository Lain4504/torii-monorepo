import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Flashcard, FlashcardDeck } from '@prisma/generated';
import {
  FlashcardResponseDTO,
  FlashcardDeckResponseDTO,
  FlashcardDifficulty,
} from '@workspace/schemas';

/**
 * Flashcard AutoMapper Profile
 * Maps Flashcard and FlashcardDeck entities (Prisma) to DTOs
 */
@Injectable()
export class FlashcardProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      // Helper for difficulty level
      const toDifficultyLevel = (difficulty: string): FlashcardDifficulty => {
        switch (difficulty?.toLowerCase()) {
          case 'easy':
            return FlashcardDifficulty.EASY;
          case 'medium':
            return FlashcardDifficulty.MEDIUM;
          case 'hard':
            return FlashcardDifficulty.HARD;
          default:
            return FlashcardDifficulty.DIFFICULTY_UNSPECIFIED;
        }
      };

      // Mapping for Flashcard
      createMap(
        mapper,
        'Flashcard',
        'FlashcardResponseDTO',
        forMember(
          (dest: FlashcardResponseDTO) => dest.difficulty,
          mapFrom((src: Flashcard) => toDifficultyLevel(src.difficulty)),
        ),
        forMember(
          (dest: FlashcardResponseDTO) => dest.exampleSentence,
          mapFrom((src: Flashcard) => src.exampleSentence || undefined),
        ),
        forMember(
          (dest: FlashcardResponseDTO) => dest.pronunciation,
          mapFrom((src: Flashcard) => src.pronunciation || undefined),
        ),
        forMember(
          (dest: FlashcardResponseDTO) => dest.imageUrl,
          mapFrom((src: Flashcard) => src.imageUrl || undefined),
        ),
        forMember(
          (dest: FlashcardResponseDTO) => dest.audioUrl,
          mapFrom((src: Flashcard) => src.audioUrl || undefined),
        ),
        forMember(
          (dest: FlashcardResponseDTO) => dest.furigana,
          mapFrom((src: Flashcard) => src.furigana || undefined),
        ),
        forMember(
          (dest: FlashcardResponseDTO) => dest.kanji,
          mapFrom((src: Flashcard) => src.kanji || undefined),
        ),
        forMember(
          (dest: FlashcardResponseDTO) => dest.partOfSpeech,
          mapFrom((src) => src.partOfSpeech || undefined),
        ),
        forMember(
          (dest: FlashcardResponseDTO) => dest.wordJlptLevel,
          mapFrom((src: Flashcard) => src.wordJlptLevel || undefined),
        ),
        forMember(
          (dest: FlashcardResponseDTO) => dest.meanings,
          mapFrom((src: Flashcard) => (src.meanings as any) || []),
        ),
        forMember(
          (dest: FlashcardResponseDTO) => dest.sourceDocumentId,
          mapFrom((src: Flashcard) => src.sourceDocumentId || undefined),
        ),
        forMember(
          (dest: FlashcardResponseDTO) => dest.generationMetadata,
          mapFrom((src: Flashcard) => (src.generationMetadata as any) || {}),
        ),
        forMember(
          (dest: FlashcardResponseDTO) => dest.notes,
          mapFrom((src: Flashcard) => src.notes || undefined),
        ),
        forMember(
          (dest: FlashcardResponseDTO) => dest.nextReviewDate,
          mapFrom((src: Flashcard) => src.nextReviewDate || undefined),
        ),
        forMember(
          (dest: FlashcardResponseDTO) => dest.lastReviewDate,
          mapFrom((src: Flashcard) => src.lastReviewDate || undefined),
        ),
        forMember(
          (dest: FlashcardResponseDTO) => dest.easeFactor,
          mapFrom((src: Flashcard) => Number(src.easeFactor)),
        ),
      );

      // Mapping for FlashcardDeck
      createMap(
        mapper,
        'FlashcardDeck',
        'FlashcardDeckResponseDTO',
        forMember(
          (dest: FlashcardDeckResponseDTO) => dest.description,
          mapFrom((src: FlashcardDeck) => src.description || undefined),
        ),
        forMember(
          (dest: FlashcardDeckResponseDTO) => dest.jlptLevel,
          mapFrom((src: FlashcardDeck) => src.jlptLevel || undefined),
        ),
        forMember(
          (dest: FlashcardDeckResponseDTO) => dest.srsSettings,
          mapFrom(
            (src: FlashcardDeck) => (src.srsSettings as any) || undefined,
          ),
        ),
        forMember(
          (dest: FlashcardDeckResponseDTO) => dest.aiSettings,
          mapFrom((src: FlashcardDeck) => (src.aiSettings as any) || undefined),
        ),
        forMember(
          (dest: FlashcardDeckResponseDTO) => dest.sourceType,
          mapFrom((src: FlashcardDeck) => src.sourceType || 'manual'),
        ),
        forMember(
          (dest: FlashcardDeckResponseDTO) => dest.lastStudiedAt,
          mapFrom((src: FlashcardDeck) => src.lastStudiedAt || undefined),
        ),
        forMember(
          (dest: FlashcardDeckResponseDTO) => dest.masteryPercentage,
          mapFrom((src: FlashcardDeck) =>
            src.masteryPercentage ? Number(src.masteryPercentage) : undefined,
          ),
        ),
      );
    };
  }
}
