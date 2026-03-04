import type {
    AttendanceCreateDTO,
    AttendanceUpdateDTO,
    AttendanceQueryDTO,
    AttendanceResponseDTO,
    AttendancePaginatedResponse,
} from '@workspace/schemas';

export interface IAttendanceService {
    /**
     * Create data.
     */
    create(dto: AttendanceCreateDTO): Promise<AttendanceResponseDTO>;
    /**
     * Update data.
     */
    update(id: string, dto: AttendanceUpdateDTO): Promise<AttendanceResponseDTO>;
    /**
     * Find by id.
     */
    findById(id: string): Promise<AttendanceResponseDTO | null>;
    /**
     * Find all.
     */
    findAll(query: AttendanceQueryDTO): Promise<AttendancePaginatedResponse>;
    /**
     * Mark attendance.
     */
    markAttendance(liveSessionId: string, userId: string, status: string): Promise<AttendanceResponseDTO>;
    /**
     * Execute process user joined operation.
     */
    processUserJoined(liveSessionId: string, userId: string): Promise<void>;
    /**
     * Execute process user left operation.
     */
    processUserLeft(liveSessionId: string, userId: string): Promise<void>;
    /**
     * Execute process final attendance operation.
     */
    processFinalAttendance(liveSessionId: string): Promise<void>;
}
