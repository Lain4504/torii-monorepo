import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { LessonProgress, Prisma } from '@prisma/generated';
import { ILearningProgressRepository } from '../../interfaces/repositories';

@Injectable()
export class LearningProgressRepository implements ILearningProgressRepository {
    private readonly logger = new Logger(LearningProgressRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    async findByEnrollmentAndLesson(enrollmentId: string, lessonId: string): Promise<LessonProgress | null> {
        return this.prisma.lessonProgress.findUnique({
            where: {
                enrollmentId_lessonId: {
                    enrollmentId,
                    lessonId,
                },
            },
        });
    }

    async upsert(
        enrollmentId: string,
        lessonId: string,
        createData: Prisma.LessonProgressCreateInput,
        updateData: Prisma.LessonProgressUpdateInput
    ): Promise<LessonProgress> {
        return this.prisma.lessonProgress.upsert({
            where: {
                enrollmentId_lessonId: {
                    enrollmentId,
                    lessonId,
                },
            },
            create: createData,
            update: updateData,
        });
    }

    async countCompletedLessons(enrollmentId: string): Promise<number> {
        return this.prisma.lessonProgress.count({
            where: {
                enrollmentId,
                status: 'completed',
            },
        });
    }

    async getTotalLearningSeconds(enrollmentIds: string[]): Promise<number> {
        if (enrollmentIds.length === 0) return 0;

        const result = await this.prisma.lessonProgress.aggregate({
            _sum: {
                watchedDuration: true,
            },
            where: {
                enrollmentId: {
                    in: enrollmentIds,
                },
            },
        });

        return result._sum?.watchedDuration || 0;
    }
}
