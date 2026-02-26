import type {
    AttendanceCreateDTO,
    AttendanceUpdateDTO,
    AttendanceQueryDTO,
    AttendanceResponseDTO,
    AttendancePaginatedResponse,
} from '@workspace/schemas';

export interface IAttendanceService {
    create(dto: AttendanceCreateDTO): Promise<AttendanceResponseDTO>;
    update(id: string, dto: AttendanceUpdateDTO): Promise<AttendanceResponseDTO>;
    findById(id: string): Promise<AttendanceResponseDTO | null>;
    findAll(query: AttendanceQueryDTO): Promise<AttendancePaginatedResponse>;
    markAttendance(liveSessionId: string, userId: string, status: string): Promise<AttendanceResponseDTO>;
}
