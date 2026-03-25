import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/api-client'
import type {
  AcademyStudySetCreateDTO,
  AcademyStudySetUpdateDTO,
  AcademyStudySetModel,
  StandardApiResponse,
} from '@workspace/schemas'

export const academyStudySetCatalogsApi = {
  async findAll() {
    const res = await apiClient.get<StandardApiResponse<{ items: AcademyStudySetModel[] }>>(
      '/api/academy/study-set-catalogs/admin',
    )
    return res.data.data!.items
  },

  async create(input: AcademyStudySetCreateDTO) {
    const res = await apiClient.post<StandardApiResponse<{ item: AcademyStudySetModel }>>(
      '/api/academy/study-set-catalogs/admin',
      input,
    )
    return res.data.data!.item
  },

  async update(id: string, input: AcademyStudySetUpdateDTO) {
    const res = await apiClient.patch<StandardApiResponse<{ item: AcademyStudySetModel }>>(
      `/api/academy/study-set-catalogs/admin/${id}`,
      input,
    )
    return res.data.data!.item
  },

  async remove(id: string) {
    const res = await apiClient.delete<StandardApiResponse<{ result: boolean }>>(
      `/api/academy/study-set-catalogs/admin/${id}`,
    )
    return res.data.data!.result
  },
}

export function useAcademyStudySetCatalogs() {
  return useQuery({
    queryKey: ['academy-study-set-catalogs-admin'],
    queryFn: academyStudySetCatalogsApi.findAll,
  })
}

export function useCreateAcademyStudySetCatalog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: academyStudySetCatalogsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academy-study-set-catalogs-admin'] }),
  })
}

export function useUpdateAcademyStudySetCatalog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AcademyStudySetUpdateDTO }) =>
      academyStudySetCatalogsApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academy-study-set-catalogs-admin'] }),
  })
}

export function useDeleteAcademyStudySetCatalog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academyStudySetCatalogsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academy-study-set-catalogs-admin'] }),
  })
}
