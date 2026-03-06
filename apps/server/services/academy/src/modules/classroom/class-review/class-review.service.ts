import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { GamificationService } from '../../gamification/gamification.service';
import { AuditLoggerService } from '../../audit-logger.service';
import type {
    ClassReviewCreateDto,
    ClassReviewUpdateDto,
    ClassReviewQueryDto,
    ClassReviewAdminQueryDto,
    ClassReviewModerateDto,
} from './dto/class-review.dto';
import { ActivityType, GamificationCurrency, GamificationTransactionType } from '@prisma/generated';

/** Points awarded for leaving a first review */
const POINT_REWARD_FOR_REVIEW = 50;

@Injectable()
export class ClassReviewService {
    private readonly logger = new Logger(ClassReviewService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly gamification: GamificationService,
        private readonly audit: AuditLoggerService,
    ) { }

    // ─────────────────────────────────────────────────────────────────────────
    // Public / Learner operations
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * List published reviews for a class.
     * Anonymous reviews will have their user info hidden.
     */
    async listClassReviews(classId: string, query: ClassReviewQueryDto) {
        const status = query.status ?? 'PUBLISHED';

        const [items, total] = await this.prisma.$transaction([
            this.prisma.classReview.findMany({
                where: { classId, status },
                include: {
                    user: {
                        select: { id: true, displayName: true, avatarUrl: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: query.limit,
                skip: query.offset,
            }),
            this.prisma.classReview.count({ where: { classId, status } }),
        ]);

        return {
            items: items.map((r) => this._maskAnonymous(r)),
            total,
            limit: query.limit,
            offset: query.offset,
        };
    }

    /** Return all reviews belonging to the current user */
    async listMyReviews(userId: string) {
        const items = await this.prisma.classReview.findMany({
            where: { userId },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                        courseProfile: { select: { title: true, thumbnailUrl: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return items;
    }

    /**
     * Create a review.
     * Validates: enrollment ownership, class match, eligibility status,
     * uniqueness per enrollment.
     */
    async createReview(
        classId: string,
        userId: string,
        dto: ClassReviewCreateDto,
    ) {
        // 1. Fetch enrollment
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: dto.enrollmentId },
            include: { class: { select: { mode: true } } },
        });

        if (!enrollment) throw new NotFoundException('Enrollment not found');
        if (enrollment.userId !== userId) {
            throw new ForbiddenException('Enrollment does not belong to you');
        }
        if (enrollment.classId !== classId) {
            throw new BadRequestException(
                'Enrollment classId does not match the target class',
            );
        }

        // 2. Validate enrollment status eligibility
        await this._validateEligibility(enrollment);

        // 3. Ensure no existing review for this enrollment
        const existing = await this.prisma.classReview.findUnique({
            where: { enrollmentId: dto.enrollmentId },
        });
        if (existing) {
            throw new BadRequestException(
                'REVIEW_ALREADY_EXISTS: A review already exists for this enrollment',
            );
        }

        // 4. Determine status (simple mode: auto PUBLISHED)
        const status =
            dto.rating <= 2 ? 'PENDING' : 'PUBLISHED';
        const publishedAt = status === 'PUBLISHED' ? new Date() : null;

        // 5. Create review
        const review = await this.prisma.classReview.create({
            data: {
                classId,
                enrollmentId: dto.enrollmentId,
                userId,
                rating: dto.rating,
                title: dto.title,
                content: dto.content,
                isAnonymous: dto.isAnonymous ?? false,
                status,
                publishedAt,
            },
        });

        // 6. Award gamification points if review is immediately PUBLISHED
        if (status === 'PUBLISHED') {
            await this._earnGamificationForReview(userId, review.id, {
                classId,
                enrollmentId: dto.enrollmentId,
                rating: dto.rating,
            });
        }

        return review;
    }

    /**
     * Update a review.
     * Only owner or admin can update.
     */
    async updateReview(id: string, userId: string, dto: ClassReviewUpdateDto, isAdmin = false) {
        const review = await this._findOrThrow(id);

        if (!isAdmin && review.userId !== userId) {
            throw new ForbiddenException('Not allowed to edit this review');
        }

        // Determine new status after edit
        let newStatus = review.status;
        if (review.status === 'REJECTED') {
            // Allow user to resubmit for moderation after editing
            newStatus = 'PENDING';
        } else if (review.status === 'HIDDEN' && review.userId === userId) {
            // If user soft-deleted, restore on edit
            newStatus = 'PUBLISHED';
        }

        const publishedAt =
            newStatus === 'PUBLISHED' && !review.publishedAt
                ? new Date()
                : review.publishedAt;

        return this.prisma.classReview.update({
            where: { id },
            data: {
                rating: dto.rating,
                title: dto.title,
                content: dto.content,
                isAnonymous: dto.isAnonymous,
                status: newStatus,
                publishedAt,
            },
        });
    }

    /**
     * Soft-delete (hide) a review. Only owner can call this.
     */
    async hideReview(id: string, userId: string) {
        const review = await this._findOrThrow(id);
        if (review.userId !== userId) {
            throw new ForbiddenException('Not allowed to delete this review');
        }

        return this.prisma.classReview.update({
            where: { id },
            data: { status: 'HIDDEN', publishedAt: null },
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin operations
    // ─────────────────────────────────────────────────────────────────────────

    async adminListReviews(query: ClassReviewAdminQueryDto) {
        const where: any = {};
        if (query.classId) where.classId = query.classId;
        if (query.userId) where.userId = query.userId;
        if (query.status) where.status = query.status;
        if (query.rating) where.rating = query.rating;
        if (query.fromDate || query.toDate) {
            where.createdAt = {};
            if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
            if (query.toDate) where.createdAt.lte = new Date(query.toDate);
        }

        const [items, total] = await this.prisma.$transaction([
            this.prisma.classReview.findMany({
                where,
                include: {
                    user: { select: { id: true, displayName: true, email: true } },
                    class: { select: { id: true, name: true, courseProfileId: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: query.limit,
                skip: query.offset,
            }),
            this.prisma.classReview.count({ where }),
        ]);

        return { items, total, limit: query.limit, offset: query.offset };
    }

    async moderateReview(
        id: string,
        moderatorId: string,
        dto: ClassReviewModerateDto,
    ) {
        const review = await this._findOrThrow(id);

        let newStatus: string;
        let publishedAt = review.publishedAt;

        switch (dto.action) {
            case 'publish':
                newStatus = 'PUBLISHED';
                if (!publishedAt) publishedAt = new Date();
                break;
            case 'hide':
                newStatus = 'HIDDEN';
                publishedAt = null;
                break;
            case 'reject':
                newStatus = 'REJECTED';
                publishedAt = null;
                break;
        }

        const updated = await this.prisma.classReview.update({
            where: { id },
            data: {
                status: newStatus,
                publishedAt,
                metadata: dto.reason
                    ? { ...((review.metadata as Record<string, unknown>) ?? {}), moderationReason: dto.reason }
                    : (review.metadata ?? undefined),
            },
        });

        // If review is being published for the first time (was PENDING), award gamification
        if (dto.action === 'publish' && review.status === 'PENDING') {
            await this._earnGamificationForReview(review.userId, review.id, {
                classId: review.classId,
                enrollmentId: review.enrollmentId,
                rating: review.rating,
            });
        }

        await this.audit.log({
            userId: moderatorId,
            action: `moderate.${dto.action}`,
            entity: 'class_review',
            entityId: id,
            description: `Review ${id} moderated: ${dto.action}${dto.reason ? ` – ${dto.reason}` : ''}`,
            metadata: { action: dto.action, reason: dto.reason },
        });

        return updated;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private async _findOrThrow(id: string) {
        const review = await this.prisma.classReview.findUnique({ where: { id } });
        if (!review) throw new NotFoundException('Review not found');
        return review;
    }

    private async _validateEligibility(enrollment: {
        status: string;
        classId: string;
        userId: string;
        class: { mode: string };
    }) {
        const VALID_STATUSES = ['ACTIVE', 'COMPLETED'];

        if (!VALID_STATUSES.includes(enrollment.status)) {
            throw new BadRequestException(
                'REVIEW_NOT_ELIGIBLE: Enrollment must be ACTIVE or COMPLETED',
            );
        }

        // For ACTIVE VOD enrollments: require ≥ 70% progress
        if (enrollment.status === 'ACTIVE' && enrollment.class.mode === 'VOD') {
            const progressData = await this._getProgressPercent(
                enrollment.userId,
                enrollment.classId,
            );
            if (progressData < 70) {
                throw new BadRequestException(
                    'REVIEW_NOT_ELIGIBLE: Must complete at least 70% of lessons before reviewing',
                );
            }
        }
    }

    private async _getProgressPercent(userId: string, classId: string): Promise<number> {
        // Get all lesson ids for this class via its course edition
        const klass = await this.prisma.class.findUnique({
            where: { id: classId },
            include: {
                courseEdition: {
                    include: {
                        chapters: {
                            include: {
                                items: { where: { kind: 'LESSON' } },
                            },
                        },
                    },
                },
            },
        });

        if (!klass) return 0;

        const lessonIds = klass.courseEdition.chapters.flatMap((c) =>
            c.items.map((i) => i.referenceId),
        );
        if (lessonIds.length === 0) return 100; // No lessons = eligible

        const completed = await this.prisma.learningProgress.count({
            where: {
                userId,
                classId,
                lessonId: { in: lessonIds },
                status: 'COMPLETED',
            },
        });

        return Math.round((completed / lessonIds.length) * 100);
    }

    private _maskAnonymous(review: any) {
        if (review.isAnonymous) {
            return {
                ...review,
                user: { id: null, displayName: 'Người học ẩn danh', avatarUrl: null },
            };
        }
        return review;
    }

    private async _earnGamificationForReview(
        userId: string,
        reviewId: string,
        meta: { classId: string; enrollmentId: string; rating: number },
    ) {
        try {
            // Check if already rewarded (gamification history with this reviewId)
            const alreadyRewarded = await this.prisma.gamificationHistory.findFirst({
                where: {
                    userId,
                    activityType: ActivityType.REVIEW,
                    metadata: { path: ['reviewId'], equals: reviewId },
                },
            });

            if (alreadyRewarded) return;

            await this.prisma.$transaction(async (tx) => {
                // Ensure profile exists
                let profile = await tx.userGamification.findUnique({ where: { userId } });
                if (!profile) {
                    profile = await tx.userGamification.create({
                        data: { userId, currentXp: 0, totalXp: 0, points: 0, level: 1 },
                    });
                }

                await tx.userGamification.update({
                    where: { userId },
                    data: { points: { increment: POINT_REWARD_FOR_REVIEW } },
                });

                await tx.gamificationHistory.create({
                    data: {
                        userId,
                        amount: POINT_REWARD_FOR_REVIEW,
                        currency: GamificationCurrency.POINT,
                        type: GamificationTransactionType.EARN,
                        activityType: ActivityType.REVIEW,
                        description: `Earned points for leaving a review`,
                        metadata: {
                            reviewId,
                            classId: meta.classId,
                            enrollmentId: meta.enrollmentId,
                            rating: meta.rating,
                        },
                    },
                });
            });

            this.logger.log(
                `Awarded ${POINT_REWARD_FOR_REVIEW} points to user ${userId} for review ${reviewId}`,
            );
        } catch (err) {
            // Non-critical: log but don't fail the review creation
            this.logger.error(`Failed to award gamification for review ${reviewId}`, err);
        }
    }
}
