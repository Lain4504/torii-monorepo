import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NOTEBOOK_SERVICE_TOKEN } from '@server/learning/interfaces/services/i-notebook.service';
import type { INotebookService } from '@server/learning/interfaces/services/i-notebook.service';

@Controller()
export class NotebookHandler {
  constructor(
    @Inject(NOTEBOOK_SERVICE_TOKEN)
    private readonly notebookService: INotebookService,
  ) {}

  // ── Notebook ─────────────────────────────────────────────────

  @MessagePattern({ cmd: 'learning.notebook.create' })
  async create(
    @Payload()
    data: {
      name: string;
      description?: string;
      isPublic?: boolean;
      userId: string;
    },
  ) {
    return this.notebookService.createNotebook(data);
  }

  @MessagePattern({ cmd: 'learning.notebook.findAll' })
  async findAll(@Payload() data: { userId: string; search?: string }) {
    return this.notebookService.findAllNotebooks(data);
  }

  @MessagePattern({ cmd: 'learning.notebook.findPublic' })
  async findPublic(
    @Payload() data: { search?: string; excludeUserId?: string },
  ) {
    return this.notebookService.findPublicNotebooks(data);
  }

  @MessagePattern({ cmd: 'learning.notebook.findById' })
  async findById(@Payload() data: { id: string; userId: string }) {
    return this.notebookService.findOneNotebook(data.id, data.userId);
  }

  @MessagePattern({ cmd: 'learning.notebook.update' })
  async update(@Payload() data: { id: string; input: any; userId: string }) {
    return this.notebookService.updateNotebook(
      data.id,
      data.input,
      data.userId,
    );
  }

  @MessagePattern({ cmd: 'learning.notebook.delete' })
  async delete(@Payload() data: { id: string; userId: string }) {
    await this.notebookService.deleteNotebook(data.id, data.userId);
    return { success: true };
  }

  // ── NoteEntry ─────────────────────────────────────────────────

  @MessagePattern({ cmd: 'learning.notebook.entry.add' })
  async addEntry(
    @Payload() data: { notebookId: string; entry: any; userId: string },
  ) {
    return this.notebookService.addEntry(
      data.notebookId,
      data.entry,
      data.userId,
    );
  }

  @MessagePattern({ cmd: 'learning.notebook.entry.update' })
  async updateEntry(
    @Payload()
    data: {
      notebookId: string;
      entryId: string;
      entry: any;
      userId: string;
    },
  ) {
    return this.notebookService.updateEntry(
      data.notebookId,
      data.entryId,
      data.entry,
      data.userId,
    );
  }

  @MessagePattern({ cmd: 'learning.notebook.entry.delete' })
  async deleteEntry(
    @Payload() data: { notebookId: string; entryId: string; userId: string },
  ) {
    await this.notebookService.deleteEntry(
      data.notebookId,
      data.entryId,
      data.userId,
    );
    return { success: true };
  }

  @MessagePattern({ cmd: 'learning.notebook.entry.bulkCreate' })
  async bulkCreateEntries(
    @Payload() data: { notebookId: string; entries: any[]; userId: string },
  ) {
    return this.notebookService.bulkCreateEntries(
      data.notebookId,
      { entries: data.entries },
      data.userId,
    );
  }
}
