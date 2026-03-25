import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    AcademyCourseReviewCreateDTO,
    AcademyCourseReviewUpdateDTO,
    AcademyCourseReviewQueryDTO,
} from '@workspace/schemas';
import { apiClient } from '../api-client';

export interface ClassReview {
    id: string;
    rating: number;
    title?: string;
    content?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    user: {
        id: string | null;
        displayName: string;
        avatarUrl: string | null;
    };
    class?: {
        id: string;
        name: string;
        courseProfile?: {
            title: string;
            thumbnailUrl?: string;
        };
    };
}

interface ClassReviewListResponse {
    data: {
        items: ClassReview[];
        total: number;
        limit: number;
        offset: number;
    };
}

interface ClassReviewMyListResponse {
    data: ClassReview[];
}

export const academyClassReviewsClient = {
    /** Public: List reviews for a class */
    listByClass: async (
        cohortId: string,
        query?: AcademyCourseReviewQueryDTO,
    ) => {
        return apiClient.get<ClassReviewListResponse>(
            `/api/academy/reviews/cohorts/${cohortId}`,
            { params: query },
        );
    },

    /** Auth: List current user's reviews */
    listMine: async () => {
        return apiClient.get<ClassReviewMyListResponse>(
            '/api/academy/reviews/me',
        );
    },

    /** Auth: Create review */
    create: async (classId: string, dto: AcademyCourseReviewCreateDTO) => {
        return apiClient.post<{ data: ClassReview }>(
            `/api/academy/live-classes/${classId}/reviews`,
            dto,
        );
    },

    /** Auth: Update review */
    update: async (id: string, dto: AcademyCourseReviewUpdateDTO) => {
        return apiClient.patch<{ data: ClassReview }>(
            `/api/academy/reviews/${id}`,
            dto,
        );
    },

    /** Auth: Hide review */
    hide: async (id: string) => {
        return apiClient.delete<{ data: ClassReview }>(
            `/api/academy/reviews/${id}`,
        );
    },
};

export const academyClassReviewHooks = {
    useListByClass: (classId: string, query?: AcademyCourseReviewQueryDTO) => {
        return useQuery({
            queryKey: ['class-reviews', classId, query],
            queryFn: () => academyClassReviewsClient.listByClass(classId, query),
            enabled: !!classId,
        });
    },

    useListMine: () => {
        return useQuery({
            queryKey: ['my-class-reviews'],
            queryFn: () => academyClassReviewsClient.listMine(),
        });
    },

    useCreateReview: () => {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: ({ targetId, targetType, dto }: { targetId: string; targetType: 'COHORT' | 'VOD'; dto: AcademyCourseReviewCreateDTO }) => {
                const payload = {
                    ...dto,
                    cohortId: targetType === 'COHORT' ? targetId : undefined,
                    vodPackageId: targetType === 'VOD' ? targetId : undefined
                };
                return apiClient.post<{ data: ClassReview }>('/api/academy/reviews', payload);
            },
            onSuccess: (_, variables) => {
                qc.invalidateQueries({ queryKey: ['class-reviews', variables.targetId] });
                qc.invalidateQueries({ queryKey: ['my-class-reviews'] });
            },
        });
    },

    useUpdateReview: () => {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: ({ id, dto }: { id: string; dto: AcademyCourseReviewUpdateDTO }) =>
                academyClassReviewsClient.update(id, dto),
            onSuccess: () => {
                qc.invalidateQueries({ queryKey: ['class-reviews'] });
                qc.invalidateQueries({ queryKey: ['my-class-reviews'] });
            },
        });
    },

    useHideReview: () => {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: (id: string) => academyClassReviewsClient.hide(id),
            onSuccess: () => {
                qc.invalidateQueries({ queryKey: ['class-reviews'] });
                qc.invalidateQueries({ queryKey: ['my-class-reviews'] });
            },
        });
    },
};
