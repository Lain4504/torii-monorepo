import {
    TeachingScheduleCreateDTO,
    TeachingScheduleResponseDTO,
    ScheduleRequestCreateDTO,
    ScheduleRequestResponseDTO
} from '@workspace/schemas';
import { Requester } from '@workspace/schemas';

export interface ITeachingScheduleService {
    /**
     * Check if a lecturer is available for a given slot
     */
    checkAvailability(lecturerId: string, dayOfWeek: number, startTime: string, duration: number, excludeScheduleId?: string): Promise<{ available: boolean; conflicts?: any[] }>;

    /**
     * Assign a weekly schedule to a lecturer for a course
     */
    assignSchedule(requester: Requester, dto: TeachingScheduleCreateDTO): Promise<TeachingScheduleResponseDTO>;

    /**
     * Get all schedules for a course run
     */
    findByRun(courseRunId: string): Promise<TeachingScheduleResponseDTO[]>;

    /**
     * Get all schedules for a lecturer
     */
    findByLecturer(lecturerId: string): Promise<TeachingScheduleResponseDTO[]>;

    /**
     * Remove a teaching schedule
     */
    removeSchedule(requester: Requester, id: string): Promise<void>;

    /**
     * Create a schedule change request
     */
    createRequest(requester: Requester, dto: ScheduleRequestCreateDTO): Promise<ScheduleRequestResponseDTO>;

    /**
     * Get pending requests (for staff)
     */
    getPendingRequests(requester: Requester): Promise<ScheduleRequestResponseDTO[]>;

    /**
     * Handle a schedule request (approve/reject)
     */
    handleRequest(requester: Requester, requestId: string, action: 'approve' | 'reject'): Promise<void>;
}
