import { z } from 'zod';

// ── Create ──────────────────────────────────────────────────────────────────

export const academyClassReviewCreateDTOSchema = z.object({
    enrollmentId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    title: z.string().max(255).optional(),
    content: z.string().optional(),
    isAnonymous: z.boolean().default(false),
});
export type AcademyClassReviewCreateDTO = z.infer<
    typeof academyClassReviewCreateDTOSchema
>;

// ── Update ───────────────────────────────────────────────────────────────────

export const academyClassReviewUpdateDTOSchema = z.object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().max(255).optional(),
    content: z.string().optional(),
    isAnonymous: z.boolean().optional(),
});
export type AcademyClassReviewUpdateDTO = z.infer<
    typeof academyClassReviewUpdateDTOSchema
>;

// ── Query (public) ───────────────────────────────────────────────────────────

export const academyClassReviewQueryDTOSchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
    status: z.string().optional(),
});
export type AcademyClassReviewQueryDTO = z.infer<
    typeof academyClassReviewQueryDTOSchema
>;

// ── Admin query ──────────────────────────────────────────────────────────────

export const academyClassReviewAdminQueryDTOSchema = z.object({
    classId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    status: z.string().optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});
export type AcademyClassReviewAdminQueryDTO = z.infer<
    typeof academyClassReviewAdminQueryDTOSchema
>;

// ── Moderate ─────────────────────────────────────────────────────────────────

export const academyClassReviewModerateDTOSchema = z.object({
    action: z.enum(['publish', 'hide', 'reject']),
    reason: z.string().optional(),
});
export type AcademyClassReviewModerateDTO = z.infer<
    typeof academyClassReviewModerateDTOSchema
>;
