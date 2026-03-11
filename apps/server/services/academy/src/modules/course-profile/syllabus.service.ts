import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../audit-logger.service';

@Injectable()
export class SyllabusService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly audit: AuditLoggerService,
    ) { }

    async findAll(courseProfileId: string) {
        return this.prisma.syllabus.findMany({
            where: { courseProfileId },
            orderBy: { version: 'desc' },
            include: {
                _count: {
                    select: { lessons: true, classes: true }
                }
            }
        });
    }

    async findById(id: string) {
        const item = await this.prisma.syllabus.findUnique({
            where: { id },
            include: {
                lessons: {
                    orderBy: { orderIndex: 'asc' }
                }
            }
        });
        if (!item) throw new NotFoundException('Syllabus not found');
        return item;
    }

    /**
     * Create a new Syllabus version.
     * If sourceSyllabusId is provided, clones all lessons from it.
     */
    async create(courseProfileId: string, version: string, sourceSyllabusId?: string, requesterId?: string) {
        // Check if version already exists for this course
        const exists = await this.prisma.syllabus.findFirst({
            where: { courseProfileId, version },
        });
        if (exists) throw new BadRequestException(`Version ${version} already exists for this course.`);

        return this.prisma.$transaction(async (tx) => {
            const syllabus = await tx.syllabus.create({
                data: {
                    courseProfileId,
                    version,
                    isPublished: false,
                    isLocked: false,
                },
            });

            if (sourceSyllabusId) {
                const sourceLessons = await tx.lesson.findMany({
                    where: { syllabusId: sourceSyllabusId },
                    orderBy: { orderIndex: 'asc' },
                });

                for (const lesson of sourceLessons) {
                    await tx.lesson.create({
                        data: {
                            syllabusId: syllabus.id,
                            title: lesson.title,
                            type: lesson.type,
                            orderIndex: lesson.orderIndex,
                            quizId: lesson.quizId,
                            examId: lesson.examId,
                            assignmentId: lesson.assignmentId,
                            contentUrl: lesson.contentUrl,
                            contentBody: lesson.contentBody,
                            attachments: lesson.attachments ?? undefined,
                        },
                    });
                }
            }

            if (requesterId) {
                await this.audit.log({
                    userId: requesterId,
                    action: 'syllabus.create',
                    entity: 'Syllabus',
                    entityId: syllabus.id,
                    description: `Created syllabus version ${version} for course ${courseProfileId}${sourceSyllabusId ? ` cloned from ${sourceSyllabusId}` : ''}`,
                    metadata: { version, sourceSyllabusId },
                });
            }

            return syllabus;
        });
    }

    async publish(id: string, requesterId?: string) {
        const syllabus = await this.prisma.syllabus.findUnique({ where: { id } });
        if (!syllabus) throw new NotFoundException('Syllabus not found');

        const updated = await this.prisma.syllabus.update({
            where: { id },
            data: { isPublished: true },
        });

        if (requesterId) {
            await this.audit.log({
                userId: requesterId,
                action: 'syllabus.publish',
                entity: 'Syllabus',
                entityId: id,
                description: `Published syllabus version ${syllabus.version}`,
            });
        }

        return updated;
    }

    /**
     * Lock a syllabus (prevent lesson modifications).
     * Usually called automatically when a Class links to this syllabus.
     */
    async lock(id: string) {
        return this.prisma.syllabus.update({
            where: { id },
            data: { isLocked: true },
        });
    }

    async delete(id: string, requesterId?: string) {
        const syllabus = await this.prisma.syllabus.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { classes: true }
                }
            }
        });

        if (!syllabus) throw new NotFoundException('Syllabus not found');
        if (syllabus.isLocked || syllabus._count.classes > 0) {
            throw new BadRequestException('Cannot delete a locked syllabus or a syllabus linked to active classes.');
        }

        return this.prisma.$transaction(async (tx) => {
            // Delete all lessons first
            await tx.lesson.deleteMany({ where: { syllabusId: id } });
            await tx.syllabus.delete({ where: { id } });

            if (requesterId) {
                await this.audit.log({
                    userId: requesterId,
                    action: 'syllabus.delete',
                    entity: 'Syllabus',
                    entityId: id,
                    description: `Deleted syllabus version ${syllabus.version}`,
                });
            }

            return { ok: true };
        });
    }
}
