import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Notebook, NoteEntry, Prisma } from '@prisma/generated';
import type { INotebookRepository } from '@server/learning/interfaces/repositories/i-notebook.repository';

@Injectable()
export class NotebookRepository implements INotebookRepository {
    private readonly logger = new Logger(NotebookRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string, include?: Prisma.NotebookInclude): Promise<Notebook | null> {
        return this.prisma.notebook.findUnique({
            where: { id },
            include,
        });
    }

    async findAll(options: {
        skip: number;
        take: number;
        where?: Prisma.NotebookWhereInput;
        orderBy?: Prisma.NotebookOrderByWithRelationInput;
        include?: Prisma.NotebookInclude;
    }): Promise<Notebook[]> {
        return this.prisma.notebook.findMany({
            where: options.where,
            skip: options.skip,
            take: options.take,
            orderBy: options.orderBy || { createdAt: 'desc' },
            include: options.include,
        });
    }

    async count(where?: Prisma.NotebookWhereInput): Promise<number> {
        return this.prisma.notebook.count({ where });
    }

    async create(data: Prisma.NotebookCreateInput): Promise<Notebook> {
        return this.prisma.notebook.create({ data });
    }

    async update(id: string, data: Prisma.NotebookUpdateInput): Promise<Notebook> {
        return this.prisma.notebook.update({
            where: { id },
            data: { ...data, updatedAt: new Date() },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.notebook.delete({ where: { id } });
    }

    async findEntryById(id: string): Promise<NoteEntry | null> {
        return this.prisma.noteEntry.findUnique({ where: { id } });
    }

    async createEntry(data: Prisma.NoteEntryCreateInput): Promise<NoteEntry> {
        return this.prisma.noteEntry.create({ data });
    }

    async updateEntry(id: string, data: Prisma.NoteEntryUpdateInput): Promise<NoteEntry> {
        return this.prisma.noteEntry.update({
            where: { id },
            data: { ...data, updatedAt: new Date() },
        });
    }

    async deleteEntry(id: string): Promise<void> {
        await this.prisma.noteEntry.delete({ where: { id } });
    }

    async bulkCreateEntries(notebookId: string, entries: Omit<Prisma.NoteEntryCreateManyInput, 'notebookId'>[]): Promise<number> {
        const result = await this.prisma.noteEntry.createMany({
            data: entries.map(e => ({ ...e, notebookId })),
            skipDuplicates: true,
        });
        return result.count;
    }
}
