import { Injectable, Logger, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { NOTEBOOK_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-notebook.repository';
import type { INotebookRepository } from '@server/learning/interfaces/repositories/i-notebook.repository';
import type {
  INotebookService,
  NotebookResponseDTO,
  NoteEntryResponseDTO,
  CreateNotebookDTO,
  UpdateNotebookDTO,
  CreateNoteEntryDTO,
  UpdateNoteEntryDTO,
  BulkCreateEntriesDTO,
} from '@server/learning/interfaces/services/i-notebook.service';

@Injectable()
export class NotebookService implements INotebookService {
  private readonly logger = new Logger(NotebookService.name);

  constructor(
    @Inject(NOTEBOOK_REPOSITORY_TOKEN)
    private readonly notebookRepo: INotebookRepository,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  // ── Ownership check ──────────────────────────────────────────

  private async verifyOwnership(id: string, userId: string): Promise<any> {
    const notebook = await this.notebookRepo.findById(id, { entries: true });
    if (!notebook) {
      throw new RpcException({ status: 404, message: 'Notebook not found' });
    }
    if (notebook.userId !== userId) {
      throw new RpcException({
        status: 403,
        message: 'You do not have permission to access this notebook',
      });
    }
    return notebook;
  }

  // ── Notebook CRUD ────────────────────────────────────────────

  async createNotebook(
    data: CreateNotebookDTO & { userId: string },
  ): Promise<NotebookResponseDTO> {
    const { userId, name, description, isPublic } = data;
    try {
      // Check duplicate name for this user
      const existing = await this.notebookRepo.count({
        userId,
        name: { equals: name, mode: 'insensitive' },
      });
      if (existing > 0) {
        throw new RpcException({
          status: 400,
          message: 'Bạn đã có sổ tay với tên này rồi',
        });
      }

      const notebook = await this.notebookRepo.create({
        name,
        description: description || null,
        isPublic: isPublic ?? false,
        entryCount: 0,
        user: { connect: { id: userId } },
      });

      this.logger.log(`Notebook created: ${notebook.id} by user ${userId}`);
      return this.mapper.map(
        { ...notebook, entries: [] },
        'Notebook',
        'NotebookResponseDTO',
      );
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error('Error creating notebook', error);
      throw new RpcException({
        status: 400,
        message: `Failed to create notebook: ${error?.message}`,
      });
    }
  }

  async findAllNotebooks(params: {
    userId: string;
    search?: string;
  }): Promise<NotebookResponseDTO[]> {
    const { userId, search } = params;
    const where: any = { userId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const notebooks = await this.notebookRepo.findAll({
      skip: 0,
      take: 1000,
      where,
      orderBy: { createdAt: 'desc' },
      include: { entries: { orderBy: { createdAt: 'asc' } } },
    });

    return this.mapper.mapArray(notebooks, 'Notebook', 'NotebookResponseDTO');
  }

  async findPublicNotebooks(params: {
    search?: string;
    excludeUserId?: string;
  }): Promise<NotebookResponseDTO[]> {
    const { search, excludeUserId } = params;
    const where: any = { isPublic: true };
    if (excludeUserId) {
      where.userId = { not: excludeUserId };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const notebooks = await this.notebookRepo.findAll({
      skip: 0,
      take: 100,
      where,
      orderBy: { createdAt: 'desc' },
      include: { entries: { orderBy: { createdAt: 'asc' } } },
    });

    return this.mapper.mapArray(notebooks, 'Notebook', 'NotebookResponseDTO');
  }

  async findOneNotebook(
    id: string,
    userId: string,
  ): Promise<NotebookResponseDTO> {
    const notebook = await this.notebookRepo.findById(id, {
      entries: { orderBy: { createdAt: 'asc' } },
    });

    if (!notebook) {
      throw new RpcException({ status: 404, message: 'Notebook not found' });
    }

    // Allow read if public or owner
    if (!notebook.isPublic && notebook.userId !== userId) {
      throw new RpcException({
        status: 403,
        message: 'You do not have permission to access this notebook',
      });
    }

    return this.mapper.map(notebook, 'Notebook', 'NotebookResponseDTO');
  }

  async updateNotebook(
    id: string,
    data: UpdateNotebookDTO,
    userId: string,
  ): Promise<NotebookResponseDTO> {
    try {
      const notebook = await this.verifyOwnership(id, userId);

      if (data.name && data.name !== notebook.name) {
        const existing = await this.notebookRepo.count({
          userId,
          name: { equals: data.name, mode: 'insensitive' },
          id: { not: id },
        });
        if (existing > 0) {
          throw new RpcException({
            status: 400,
            message: 'Bạn đã có sổ tay với tên này rồi',
          });
        }
      }

      const updated = await this.notebookRepo.update(id, {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description || null,
        }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      });

      const full = await this.notebookRepo.findById(id, {
        entries: { orderBy: { createdAt: 'asc' } },
      });

      this.logger.log(`Notebook updated: ${id} by user ${userId}`);
      return this.mapper.map(full, 'Notebook', 'NotebookResponseDTO');
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: 500,
        message: `Failed to update notebook: ${error?.message}`,
      });
    }
  }

  async deleteNotebook(id: string, userId: string): Promise<void> {
    try {
      await this.verifyOwnership(id, userId);
      await this.notebookRepo.delete(id);
      this.logger.log(`Notebook deleted: ${id} by user ${userId}`);
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: 500,
        message: `Failed to delete notebook: ${error?.message}`,
      });
    }
  }

  // ── NoteEntry CRUD ───────────────────────────────────────────

  async addEntry(
    notebookId: string,
    data: CreateNoteEntryDTO,
    userId: string,
  ): Promise<NoteEntryResponseDTO> {
    try {
      await this.verifyOwnership(notebookId, userId);

      const entry = await this.notebookRepo.createEntry({
        word: data.word.trim(),
        phonetic: data.phonetic?.trim() || null,
        meaning: data.meaning.trim(),
        note: data.note?.trim() || null,
        partOfSpeech: data.partOfSpeech || 'other',
        notebook: { connect: { id: notebookId } },
      });

      // Increment entryCount
      await this.notebookRepo.update(notebookId, {
        entryCount: { increment: 1 },
      });

      return this.mapper.map(entry, 'NoteEntry', 'NoteEntryResponseDTO');
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: 400,
        message: `Failed to add entry: ${error?.message}`,
      });
    }
  }

  async updateEntry(
    notebookId: string,
    entryId: string,
    data: UpdateNoteEntryDTO,
    userId: string,
  ): Promise<NoteEntryResponseDTO> {
    try {
      await this.verifyOwnership(notebookId, userId);

      const entry = await this.notebookRepo.findEntryById(entryId);
      if (!entry || entry.notebookId !== notebookId) {
        throw new RpcException({
          status: 404,
          message: 'Note entry not found',
        });
      }

      const updated = await this.notebookRepo.updateEntry(entryId, {
        ...(data.word !== undefined && { word: data.word.trim() }),
        ...(data.phonetic !== undefined && {
          phonetic: data.phonetic?.trim() || null,
        }),
        ...(data.meaning !== undefined && { meaning: data.meaning.trim() }),
        ...(data.note !== undefined && { note: data.note?.trim() || null }),
        ...(data.partOfSpeech !== undefined && {
          partOfSpeech: data.partOfSpeech,
        }),
      });

      return this.mapper.map(updated, 'NoteEntry', 'NoteEntryResponseDTO');
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: 400,
        message: `Failed to update entry: ${error?.message}`,
      });
    }
  }

  async deleteEntry(
    notebookId: string,
    entryId: string,
    userId: string,
  ): Promise<void> {
    try {
      await this.verifyOwnership(notebookId, userId);

      const entry = await this.notebookRepo.findEntryById(entryId);
      if (!entry || entry.notebookId !== notebookId) {
        throw new RpcException({
          status: 404,
          message: 'Note entry not found',
        });
      }

      await this.notebookRepo.deleteEntry(entryId);

      // Decrement entryCount
      await this.notebookRepo.update(notebookId, {
        entryCount: { decrement: 1 },
      });
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: 500,
        message: `Failed to delete entry: ${error?.message}`,
      });
    }
  }

  async bulkCreateEntries(
    notebookId: string,
    data: BulkCreateEntriesDTO,
    userId: string,
  ): Promise<{ count: number }> {
    try {
      await this.verifyOwnership(notebookId, userId);

      const count = await this.notebookRepo.bulkCreateEntries(
        notebookId,
        data.entries.map((e) => ({
          word: e.word.trim(),
          phonetic: e.phonetic?.trim() || null,
          meaning: e.meaning.trim(),
          note: e.note?.trim() || null,
          partOfSpeech: e.partOfSpeech || 'other',
        })),
      );

      // Update entryCount
      await this.notebookRepo.update(notebookId, {
        entryCount: { increment: count },
      });

      return { count };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: 400,
        message: `Failed to bulk create entries: ${error?.message}`,
      });
    }
  }
}
