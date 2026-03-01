import type { CourseRunResponseDTO, CourseRunCreateDTO, CourseRunUpdateDTO, CourseRunSearchRequestDTO, PaginatedApiResponse, Requester, CourseRunStatus } from '@workspace/schemas';

export interface ICourseRunService {
    create(requester: Requester, dto: CourseRunCreateDTO): Promise<CourseRunResponseDTO>;
    update(requester: Requester, id: string, dto: CourseRunUpdateDTO): Promise<CourseRunResponseDTO>;
    updateStatus(requester: Requester, id: string, status: CourseRunStatus): Promise<CourseRunResponseDTO>;
    findById(id: string): Promise<CourseRunResponseDTO>;
    findAll(query: CourseRunSearchRequestDTO): Promise<PaginatedApiResponse<CourseRunResponseDTO>>;
    getStudentsByCourseRun(id: string, page?: number, limit?: number): Promise<any>;
    delete(requester: Requester, id: string): Promise<void>;
}
