import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import {
    ILearningProgressRepository, LEARNING_PROGRESS_REPOSITORY_TOKEN,
    IEnrollmentRepository, ENROLLMENT_REPOSITORY_TOKEN,
    ICourseRepository, COURSE_REPOSITORY_TOKEN,
    ILessonRepository, LESSON_REPOSITORY_TOKEN,
    IModuleRepository, MODULE_REPOSITORY_TOKEN
} from '../../interfaces/repositories';
import { ILearningProgressService } from '../../interfaces/services';
import { EnrollmentStatus } from '@workspace/schemas';


@Injectable()
export class LearningProgressService implements ILearningProgressService {
    private readonly logger = new Logger(LearningProgressService.name);

    constructor(
        @Inject(LEARNING_PROGRESS_REPOSITORY_TOKEN)
        private readonly progressRepo: ILearningProgressRepository,
        @Inject(ENROLLMENT_REPOSITORY_TOKEN)
        private readonly enrollmentRepo: IEnrollmentRepository,
        @Inject(COURSE_REPOSITORY_TOKEN)
        private readonly courseRepo: ICourseRepository,
        @Inject(LESSON_REPOSITORY_TOKEN)
        private readonly lessonRepo: ILessonRepository,
        @Inject(MODULE_REPOSITORY_TOKEN)
        private readonly moduleRepo: IModuleRepository,
    ) { }

    async getMyCourses(userId: string) {
        // cast to any to workaround type issue with findMany options if strict
        const enrollments = await this.enrollmentRepo.findMany({
            where: {
                userId,
                completionStatus: { in: [EnrollmentStatus.IN_PROGRESS, EnrollmentStatus.COMPLETED] as any },
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        thumbnailUrl: true,
                        totalLessons: true,
                        instructors: {
                            where: { isPrimary: true },
                            take: 1,
                        }
                    }
                }
            },
            orderBy: { lastAccessedAt: 'desc' },
            skip: 0,
            take: 100
        });

        // Compute additional stats if needed, eg. completedLessons count
        // For performance, we could do a groupBy query, but for < 100 courses it's fine to loop
        const data = await Promise.all(enrollments.map(async (e: any) => {
            const completedLessons = await this.progressRepo.countCompletedLessons(e.id);

            // Fix totalLessons if 0
            let totalLessons = e.course.totalLessons;
            if (totalLessons === 0) {
                // Recalculate if 0 using lesson repo
                // Note: We need to cast 'where' to any if necessary or ensure LessonWhereInput supports module relation
                totalLessons = await this.lessonRepo.count({
                    module: {
                        courseId: e.course.id
                    },
                    deletedAt: null
                } as any);

                // Update course stats asynchronously if corrected
                if (totalLessons > 0) {
                    this.courseRepo.updateStats(e.course.id, { totalLessons }).catch(console.error);
                }
            }

            // Auto-correct percentage if needed
            let progress = Number(e.completionPercentage);
            if (totalLessons > 0) {
                const calculated = Math.round((completedLessons / totalLessons) * 100);
                if (Math.abs(calculated - progress) > 5) {
                    progress = calculated;
                    // Async update correction
                    this.enrollmentRepo.update(e.id, { completionPercentage: progress }).catch(console.error);
                }
            } else {
                // If total lessons is actually 0, progress should be 0 (or 100 if completed? No 0 is safer)
                progress = 0;
            }

            return {
                id: e.course.id,
                slug: e.course.slug,
                title: e.course.title,
                thumbnailUrl: e.course.thumbnailUrl,
                instructor: "Top Instructor", // Placeholder until relation fixed
                progress: progress,
                totalLessons: totalLessons,
                completedLessons: completedLessons,
                lastAccessed: e.lastAccessedAt ? e.lastAccessedAt.toISOString() : null,
                status: e.completionStatus,
            };
        }));

        return data;
    }

    async trackLessonProgress(userId: string, lessonId: string, seconds: number, totalSeconds: number) {
        // 1. Get lesson to find courseId
        const lesson = await this.lessonRepo.findById(lessonId);
        if (!lesson) throw new NotFoundException('Lesson not found');

        // Use moduleRepo to get courseId since lessonRepo.findById doesn't include module
        const module = await this.moduleRepo.findById(lesson.moduleId);
        if (!module) throw new NotFoundException('Module not found for lesson');
        const courseId = module.courseId;

        // 2. Find Enrollment
        const enrollment = await this.enrollmentRepo.findByUserAndCourse(userId, courseId);

        if (!enrollment) {
            throw new BadRequestException('User is not enrolled in this course');
        }

        // 3. Determine completion
        const isCompleted = (seconds / totalSeconds) > 0.90;
        const status = isCompleted ? 'completed' : 'in_progress';

        // 4. Upsert Progress
        await this.progressRepo.upsert(
            enrollment.id,
            lessonId,
            {
                enrollment: { connect: { id: enrollment.id } },
                lesson: { connect: { id: lessonId } },
                watchedDuration: Math.floor(seconds),
                totalDuration: Math.floor(totalSeconds),
                status: status,
                lastWatchedAt: new Date(),
                completedAt: isCompleted ? new Date() : null,
            },
            {
                watchedDuration: Math.floor(seconds),
                totalDuration: Math.floor(totalSeconds),
                lastWatchedAt: new Date(),
                status: isCompleted ? 'completed' : undefined, // Only upgrade to completed
                completedAt: isCompleted ? new Date() : undefined,
            }
        );

        // 5. Update Course Progress
        const course = await this.courseRepo.findById(courseId);
        if (course && course.totalLessons > 0) {
            const completedCount = await this.progressRepo.countCompletedLessons(enrollment.id);
            const percentage = Math.min(100, Math.round((completedCount / course.totalLessons) * 100));

            await this.enrollmentRepo.update(enrollment.id, {
                completionPercentage: percentage,
                lastAccessedAt: new Date(),
                completionStatus: percentage >= 100 ? EnrollmentStatus.COMPLETED : EnrollmentStatus.IN_PROGRESS,
                completedAt: percentage >= 100 ? new Date() : null
            });
        }

        return { success: true };
    }
    async getUserLearningStats(userId: string) {
        this.logger.log(`Getting stats for user ${userId}`);
        const enrollments = await this.enrollmentRepo.findMany({
            where: { userId },
            skip: 0,
            take: 1000,
        });

        const totalCourses = enrollments.length;
        const completedCourses = enrollments.filter((e: any) => e.completionStatus === EnrollmentStatus.COMPLETED).length;
        const inProgressCourses = enrollments.filter((e: any) => e.completionStatus === EnrollmentStatus.IN_PROGRESS).length;

        const enrollmentIds = enrollments.map((e: any) => e.id);
        const totalSecondsWatched = await this.progressRepo.getTotalLearningSeconds(enrollmentIds);
        const totalLearningHours = Math.round((totalSecondsWatched / 3600) * 10) / 10;

        let averageProgress = 0;
        if (totalCourses > 0) {
            const totalPercentage = enrollments.reduce((acc: number, curr: any) => acc + (Number(curr.completionPercentage) || 0), 0);
            averageProgress = Math.round(totalPercentage / totalCourses);
        }

        return {
            totalCourses,
            completedCourses,
            inProgressCourses,
            totalLearningHours,
            averageProgress,
            currentStreak: 0, // Placeholder
            totalCertificates: completedCourses
        };
    }

    async getCompletedLessons(userId: string, courseId: string): Promise<string[]> {
        // Find enrollment for this user and course
        const enrollment = await this.enrollmentRepo.findByUserAndCourse(userId, courseId);

        if (!enrollment) {
            return [];
        }

        // Get all completed lesson IDs using repository method
        return await this.progressRepo.getCompletedLessonIds(enrollment.id);
    }
}
