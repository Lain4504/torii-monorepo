import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    AcademyClassReviewCreateDTO,
    AcademyClassReviewUpdateDTO,
    AcademyClassReviewQueryDTO,
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
        classId: string,
        query?: AcademyClassReviewQueryDTO,
    ) => {
        return apiClient.get<ClassReviewListResponse>(
            `/api/academy/classes/${classId}/reviews`,
            { params: query },
        );
    },

    /** Auth: List current user's reviews */
    listMine: async () => {
        return apiClient.get<ClassReviewMyListResponse>(
            '/api/academy/me/class-reviews',
        );
    },

    /** Auth: Create review */
    create: async (classId: string, dto: AcademyClassReviewCreateDTO) => {
        return apiClient.post<{ data: ClassReview }>(
            `/api/academy/classes/${classId}/reviews`,
            dto,
        );
    },

    /** Auth: Update review */
    update: async (id: string, dto: AcademyClassReviewUpdateDTO) => {
        return apiClient.patch<{ data: ClassReview }>(
            `/api/academy/class-reviews/${id}`,
            dto,
        );
    },

    /** Auth: Hide review */
    hide: async (id: string) => {
        return apiClient.delete<{ data: ClassReview }>(
            `/api/academy/class-reviews/${id}`,
        );
    },
};

export const academyClassReviewHooks = {
    useListByClass: (classId: string, query?: AcademyClassReviewQueryDTO) => {
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
            mutationFn: ({ classId, dto }: { classId: string; dto: AcademyClassReviewCreateDTO }) =>
                academyClassReviewsClient.create(classId, dto),
            onSuccess: (_, variables) => {
                qc.invalidateQueries({ queryKey: ['class-reviews', variables.classId] });
                qc.invalidateQueries({ queryKey: ['my-class-reviews'] });
            },
        });
    },

    useUpdateReview: () => {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: ({ id, dto }: { id: string; dto: AcademyClassReviewUpdateDTO }) =>
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
