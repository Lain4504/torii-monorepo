import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { SyllabusStatus } from '@prisma/generated';
import { AuditLoggerService } from '../audit-logger.service';

export interface SyllabusCreateDto {
    courseProfileId: string;
    versionLabel: string;
    sourceSyllabusId?: string;
}

@Injectable()
export class SyllabusService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly audit: AuditLoggerService,
    ) { }

    async findAll(courseProfileId: string) {
        return this.prisma.syllabus.findMany({
            where: { courseProfileId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { modules: true, classes: true } },
            },
        });
    }

    async findById(id: string) {
        const item = await this.prisma.syllabus.findUnique({
            where: { id },
            include: {
                modules: {
                    include: {
                        lessons: { orderBy: { orderIndex: 'asc' } },
                    },
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });
        if (!item) throw new NotFoundException('Syllabus not found');
        return item;
    }

    /**
     * Create a new Syllabus version.
     * If sourceSyllabusId is provided, clones all modules+lessons from it.
     */
    async create(input: SyllabusCreateDto, requesterId?: string) {
        const exists = await this.prisma.syllabus.findFirst({
            where: { courseProfileId: input.courseProfileId, versionLabel: input.versionLabel },
        });
        if (exists) {
            throw new BadRequestException(`Version "${input.versionLabel}" already exists for this course.`);
        }

        return this.prisma.$transaction(async (tx) => {
            const syllabus = await tx.syllabus.create({
                data: {
                    courseProfileId: input.courseProfileId,
                    versionLabel: input.versionLabel,
                    status: 'ACTIVE' as SyllabusStatus,
                },
            });

            // Clone from source if provided
            if (input.sourceSyllabusId) {
                const sourceModules = await tx.module.findMany({
                    where: { syllabusId: input.sourceSyllabusId },
                    include: { lessons: { orderBy: { orderIndex: 'asc' } } },
                    orderBy: { orderIndex: 'asc' },
                });

                for (const mod of sourceModules) {
                    const newModule = await tx.module.create({
                        data: {
                            syllabusId: syllabus.id,
                            title: mod.title,
                            orderIndex: mod.orderIndex,
                        },
                    });

                    for (const lesson of mod.lessons) {
                        await tx.lesson.create({
                            data: {
                                moduleId: newModule.id,
                                title: lesson.title,
                                type: lesson.type,
                                orderIndex: lesson.orderIndex,
                                videoUrl: lesson.videoUrl ?? null,
                            },
                        });
                    }
                }
            }

            if (requesterId) {
                await this.audit.log({
                    userId: requesterId,
                    action: 'syllabus.create',
                    entity: 'Syllabus',
                    entityId: syllabus.id,
                    description: `Created syllabus "${input.versionLabel}"${input.sourceSyllabusId ? ` (cloned from ${input.sourceSyllabusId})` : ''}`,
                });
            }

            return syllabus;
        });
    }

    /** Manually lock a syllabus */
    async lock(id: string, requesterId?: string) {
        const syllabus = await this.prisma.syllabus.findUnique({ where: { id } });
        if (!syllabus) throw new NotFoundException('Syllabus not found');

        const result = await this.prisma.syllabus.update({
            where: { id },
            data: { status: 'LOCKED' as SyllabusStatus },
        });

        if (requesterId) {
            await this.audit.log({
                userId: requesterId,
                action: 'syllabus.lock',
                entity: 'Syllabus',
                entityId: id,
                description: `Locked syllabus "${syllabus.versionLabel}"`,
            });
        }

        return result;
    }

    async delete(id: string, requesterId?: string) {
        const syllabus = await this.prisma.syllabus.findUnique({
            where: { id },
            include: { _count: { select: { classes: true } } },
        });
        if (!syllabus) throw new NotFoundException('Syllabus not found');

        if (syllabus.status === 'LOCKED' || syllabus._count.classes > 0) {
            throw new BadRequestException('Cannot delete a locked syllabus or one linked to classes.');
        }

        await this.prisma.syllabus.delete({ where: { id } });

        if (requesterId) {
            await this.audit.log({
                userId: requesterId,
                action: 'syllabus.delete',
                entity: 'Syllabus',
                entityId: id,
                description: `Deleted syllabus "${syllabus.versionLabel}"`,
            });
        }

        return { ok: true };
    }
}
