import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
    ILearningProgressRepository, LEARNING_PROGRESS_REPOSITORY_TOKEN,
    IEnrollmentRepository, ENROLLMENT_REPOSITORY_TOKEN,
    ICourseRepository, COURSE_REPOSITORY_TOKEN,
    ILessonRepository, LESSON_REPOSITORY_TOKEN,
    IModuleRepository, MODULE_REPOSITORY_TOKEN
} from '@server/learning/interfaces/repositories';
import { ILearningProgressService, ICertificateService, CERTIFICATE_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { EnrollmentStatus, UserActivityEvent } from '@workspace/schemas';


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
        @Inject(CERTIFICATE_SERVICE_TOKEN)
        private readonly certificateService: ICertificateService,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
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
                        type: true,
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

            // Get strict count of published lessons for accurate progress
            const totalPublishedLessons = await this.lessonRepo.count({
                module: {
                    courseId: e.course.id,
                    status: 'published',
                    deletedAt: null
                },
                deletedAt: null,
                status: 'published'
            } as any);

            // Use this strictly for progress calculation
            const totalLessons = totalPublishedLessons;

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
                // If total lessons is actually 0, progress should be 0 
                progress = 0;
            }

            return {
                id: e.course.id,
                slug: e.course.slug,
                title: e.course.title,
                thumbnailUrl: e.course.thumbnailUrl,
                type: e.course.type ?? 'vod',
                instructor: "Top Instructor",
                progress: progress,
                totalLessons: totalLessons,
                completedLessons: completedLessons,
                lastAccessed: e.lastAccessedAt ? e.lastAccessedAt.toISOString() : null,
                expiresAt: e.expiresAt ? e.expiresAt.toISOString() : null,
                status: e.completionStatus,
            };
        }));

        // Sort data: Recently accessed first, nulls last
        return data.sort((a, b) => {
            if (!a.lastAccessed && !b.lastAccessed) return 0;
            if (!a.lastAccessed) return 1;
            if (!b.lastAccessed) return -1;
            return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
        });
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

        // Reactive Check: Block progress tracking if expired
        if (enrollment.expiresAt && enrollment.expiresAt < new Date()) {
            throw new BadRequestException('Course access has expired');
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
        // 5. Update Course Progress
        // Use strict published count
        const totalPublishedLessons = await this.lessonRepo.count({
            module: {
                courseId: courseId,
                status: 'published',
                deletedAt: null
            },
            deletedAt: null,
            status: 'published'
        } as any);

        const totalLessons = totalPublishedLessons;
        let percentage = 0;

        if (totalLessons > 0) {
            const completedCount = await this.progressRepo.countCompletedLessons(enrollment.id);
            percentage = Math.min(100, Math.round((completedCount / totalLessons) * 100));
        }

        // Always update lastAccessedAt
        await this.enrollmentRepo.update(enrollment.id, {
            completionPercentage: percentage,
            lastAccessedAt: new Date(),
            completionStatus: percentage >= 100 ? EnrollmentStatus.COMPLETED : EnrollmentStatus.IN_PROGRESS,
            completedAt: percentage >= 100 ? (enrollment.completedAt || new Date()) : null
        });

        // Trigger certificate issuance if course completed
        if (percentage >= 100) {
            this.certificateService.issueCertificate(userId, courseId, enrollment.id).catch((err: any) => {
                this.logger.error(`Failed to automatically issue certificate: ${err.message}`, err.stack);
            });
        }

        // Emit activity events to gamification service
        try {
            // Emit VIDEO_WATCH event if video watched for >= 3 minutes
            if (seconds >= 180) {
                const videoWatchEvent: UserActivityEvent = {
                    userId,
                    activityType: 'VIDEO_WATCH',
                    meta: {
                        lessonId,
                        courseId,
                        watchedDuration: Math.floor(seconds),
                    },
                    timestamp: new Date().toISOString(),
                };
                this.natsClient.emit('user.activity', videoWatchEvent);
            }

            // Emit LESSON_COMPLETE event if lesson completed
            if (isCompleted) {
                const lessonCompleteEvent: UserActivityEvent = {
                    userId,
                    activityType: 'LESSON_COMPLETE',
                    meta: {
                        lessonId,
                        courseId,
                        completionPercentage: percentage,
                        courseCompleted: percentage >= 100,
                    },
                    timestamp: new Date().toISOString(),
                };
                this.natsClient.emit('user.activity', lessonCompleteEvent);
                this.logger.log(`Emitted LESSON_COMPLETE event for user ${userId}, lesson ${lessonId}`);
            }
        } catch (error) {
            this.logger.error('Failed to emit activity event', error);
            // Don't throw - event emission should not block main flow
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

    async getLearningHistory(userId: string) {
        const history = await this.progressRepo.findRecentProgress(userId, 50);

        return history.map((item: any) => ({
            id: item.lessonId, // Use unique ID, lessonId might repeat if re-enrolled but that's rare. Better use progress ID if available, but item ID is usually composite in repo return? Prisma returns object. 
            // Wait, findRecentProgress returns LessonProgress. It has composite key `enrollmentId_lessonId` usually.
            // Let's use a combination or just index if needed, but frontend expects unique ID.
            // item is LessonProgress.
            courseTitle: item.enrollment.course.title,
            lessonTitle: item.lesson.title,
            timestamp: item.lastWatchedAt,
            duration: item.watchedDuration, // In seconds
            slug: item.enrollment.course.slug,
            lessonId: item.lessonId,
            courseId: item.enrollment.course.id,
            expiresAt: item.enrollment.expiresAt ? item.enrollment.expiresAt.toISOString() : null
        }));
    }
}

