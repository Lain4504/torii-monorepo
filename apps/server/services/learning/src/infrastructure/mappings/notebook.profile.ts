import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Notebook, NoteEntry } from '@prisma/generated';
import type {
  NotebookResponseDTO,
  NoteEntryResponseDTO,
} from '@server/learning/interfaces/services/i-notebook.service';

/**
 * Notebook AutoMapper Profile
 * Maps Notebook and NoteEntry entities (Prisma) to DTOs
 */
@Injectable()
export class NotebookProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      // Mapping for NoteEntry
      createMap(
        mapper,
        'NoteEntry',
        'NoteEntryResponseDTO',
        forMember(
          (dest: NoteEntryResponseDTO) => dest.id,
          mapFrom((src: NoteEntry) => src.id),
        ),
        forMember(
          (dest: NoteEntryResponseDTO) => dest.notebookId,
          mapFrom((src: NoteEntry) => src.notebookId),
        ),
        forMember(
          (dest: NoteEntryResponseDTO) => dest.word,
          mapFrom((src: NoteEntry) => src.word),
        ),
        forMember(
          (dest: NoteEntryResponseDTO) => dest.phonetic,
          mapFrom((src: NoteEntry) => src.phonetic || undefined),
        ),
        forMember(
          (dest: NoteEntryResponseDTO) => dest.meaning,
          mapFrom((src: NoteEntry) => src.meaning),
        ),
        forMember(
          (dest: NoteEntryResponseDTO) => dest.note,
          mapFrom((src: NoteEntry) => src.note || undefined),
        ),
        forMember(
          (dest: NoteEntryResponseDTO) => dest.partOfSpeech,
          mapFrom((src: NoteEntry) => src.partOfSpeech),
        ),
        forMember(
          (dest: NoteEntryResponseDTO) => dest.createdAt,
          mapFrom((src: NoteEntry) => src.createdAt.toISOString()),
        ),
        forMember(
          (dest: NoteEntryResponseDTO) => dest.updatedAt,
          mapFrom((src: NoteEntry) => src.updatedAt.toISOString()),
        ),
      );

      // Mapping for Notebook
      createMap(
        mapper,
        'Notebook',
        'NotebookResponseDTO',
        forMember(
          (dest: NotebookResponseDTO) => dest.id,
          mapFrom((src: Notebook) => src.id),
        ),
        forMember(
          (dest: NotebookResponseDTO) => dest.userId,
          mapFrom((src: Notebook) => src.userId),
        ),
        forMember(
          (dest: NotebookResponseDTO) => dest.name,
          mapFrom((src: Notebook) => src.name),
        ),
        forMember(
          (dest: NotebookResponseDTO) => dest.description,
          mapFrom((src: Notebook) => src.description || undefined),
        ),
        forMember(
          (dest: NotebookResponseDTO) => dest.isPublic,
          mapFrom((src: Notebook) => src.isPublic),
        ),
        forMember(
          (dest: NotebookResponseDTO) => dest.entryCount,
          mapFrom((src: Notebook) => src.entryCount),
        ),
        forMember(
          (dest: NotebookResponseDTO) => dest.entries,
          mapFrom((src: any) =>
            mapper.mapArray(
              src.entries || [],
              'NoteEntry',
              'NoteEntryResponseDTO',
            ),
          ),
        ),
        forMember(
          (dest: NotebookResponseDTO) => dest.createdAt,
          mapFrom((src: Notebook) => src.createdAt.toISOString()),
        ),
        forMember(
          (dest: NotebookResponseDTO) => dest.updatedAt,
          mapFrom((src: Notebook) => src.updatedAt.toISOString()),
        ),
      );
    };
  }
}
