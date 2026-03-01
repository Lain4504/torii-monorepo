import type { CourseRunResponseDTO, CourseRunCreateDTO, CourseRunUpdateDTO, CourseRunSearchRequestDTO, PaginatedApiResponse, Requester } from '@workspace/schemas';

export interface ICourseRunService {
    create(requester: Requester, dto: CourseRunCreateDTO): Promise<CourseRunResponseDTO>;
    update(requester: Requester, id: string, dto: CourseRunUpdateDTO): Promise<CourseRunResponseDTO>;
    findById(id: string): Promise<CourseRunResponseDTO>;
    findAll(query: CourseRunSearchRequestDTO): Promise<PaginatedApiResponse<CourseRunResponseDTO>>;
    delete(requester: Requester, id: string): Promise<void>;
}
