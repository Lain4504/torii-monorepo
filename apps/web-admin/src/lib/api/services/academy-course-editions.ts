import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import type {
  AcademyCourseEditionCreateDTO,
  AcademyCourseEditionQueryDTO,
  AcademyCourseEditionUpdateDTO,
  AcademyCourseEditionModel,
  StandardApiResponse,
} from '@workspace/schemas';

export const academyCourseEditionsApi = {
  async findAll(params: AcademyCourseEditionQueryDTO) {
    const res = await apiClient.get<StandardApiResponse<{ items: AcademyCourseEditionModel[] }>>(
      '/api/academy/course-editions',
      { params },
    );
    return res.data.data!.items;
  },

  async findAllPublic(params: AcademyCourseEditionQueryDTO) {
    const res = await apiClient.get<StandardApiResponse<{ items: AcademyCourseEditionModel[] }>>(
      '/api/academy/course-editions/public',
      { params },
    );
    return res.data.data!.items;
  },

  async create(input: AcademyCourseEditionCreateDTO) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyCourseEditionModel }>>(
      '/api/academy/course-editions',
      input,
    );
    return res.data.data!.item;
  },

  async update(id: string, input: AcademyCourseEditionUpdateDTO) {
    const res = await apiClient.put<StandardApiResponse<{ item: AcademyCourseEditionModel }>>(
      `/api/academy/course-editions/${id}`,
      input,
    );
    return res.data.data!.item;
  },
};

export function useAcademyCourseEditions(params: AcademyCourseEditionQueryDTO) {
  return useQuery({
    queryKey: ['academy-course-editions', params],
    queryFn: () => academyCourseEditionsApi.findAll(params),
  });
}

export function useAcademyCourseEditionsPublic(params: AcademyCourseEditionQueryDTO) {
  return useQuery({
    queryKey: ['academy-course-editions-public', params],
    queryFn: () => academyCourseEditionsApi.findAllPublic(params),
  });
}

export function useCreateAcademyCourseEdition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AcademyCourseEditionCreateDTO) =>
      academyCourseEditionsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academy-course-editions'] }),
  });
}

export function useUpdateAcademyCourseEdition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AcademyCourseEditionUpdateDTO }) =>
      academyCourseEditionsApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academy-course-editions'] }),
  });
}

