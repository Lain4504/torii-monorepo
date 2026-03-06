import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    AcademyClassReviewAdminQueryDTO,
    AcademyClassReviewModerateDTO,
} from '@workspace/schemas';
import { apiClient } from '../api-client';

const API_ROOT = '/api/academy/admin/class-reviews';

interface ClassReviewListResponse {
    data: {
        items: any[];
        total: number;
        limit: number;
        offset: number;
    };
}

interface ClassReviewModerateResponse {
    data: any;
}

export const academyClassReviewsAdminClient = {
    /** Admin: List reviews with filters */
    listReviews: async (query?: AcademyClassReviewAdminQueryDTO) => {
        return apiClient.get<ClassReviewListResponse>(API_ROOT, {
            params: query,
        });
    },

    /** Admin: Moderate a review (publish, hide, reject) */
    moderateReview: async (id: string, dto: AcademyClassReviewModerateDTO) => {
        return apiClient.post<ClassReviewModerateResponse>(
            `${API_ROOT}/${id}/moderate`,
            dto,
        );
    },
};

export const academyClassReviewsAdminHooks = {
    useListReviews: (query?: AcademyClassReviewAdminQueryDTO) => {
        return useQuery({
            queryKey: ['admin-class-reviews', query],
            queryFn: () => academyClassReviewsAdminClient.listReviews(query),
        });
    },

    useModerateReview: () => {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: ({ id, dto }: { id: string; dto: AcademyClassReviewModerateDTO }) =>
                academyClassReviewsAdminClient.moderateReview(id, dto),
            onSuccess: () => {
                qc.invalidateQueries({ queryKey: ['admin-class-reviews'] });
            },
        });
    },
};
