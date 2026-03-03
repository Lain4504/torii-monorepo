import { LiveSessionBulkCreateDTO, LiveSessionCreateDTO, LiveSessionJoinResponseDTO, LiveSessionResponseDTO, LiveSessionUpdateDTO, Requester } from '@workspace/schemas';

/**
 * Live Session Service Interface
 * Defines the contract for Live Session business logic
 */
export interface ILiveSessionService {
    /**
     * Get live session by ID
     */
    findById(id: string): Promise<LiveSessionResponseDTO>;

    /**
     * Get all live sessions for a course run
     */
    findByRunId(courseRunId: string): Promise<LiveSessionResponseDTO[]>;

    /**
     * Create a new live session
     */
    create(requester: Requester, dto: LiveSessionCreateDTO): Promise<LiveSessionResponseDTO>;

    /**
     * Create multiple live sessions (bulk scheduling)
     */
    bulkCreate(requester: Requester, dto: LiveSessionBulkCreateDTO): Promise<LiveSessionResponseDTO[]>;

    /**
     * Update a live session
     */
    update(requester: Requester, id: string, dto: LiveSessionUpdateDTO): Promise<LiveSessionResponseDTO>;

    /**
     * Delete a live session
     */
    delete(requester: Requester, id: string): Promise<{ message: string }>;

    /**
     * Start a live session (update status to live)
     */
    startSession(requester: Requester, id: string): Promise<LiveSessionResponseDTO>;

    /**
     * End a live session (update status to ended)
     */
    endSession(requester: Requester, id: string): Promise<LiveSessionResponseDTO>;

    /**
     * Join a live session (get JWT token for WebRTC)
     */
    joinSession(requester: Requester, id: string): Promise<LiveSessionJoinResponseDTO>;

    /**
     * Synchronize session state when a Meet room ends
     */
    syncEndedSession(meetingId: string): Promise<LiveSessionResponseDTO | null>;

    /**
     * Get the current active live session for a course run
     */
    findActiveByRunId(courseRunId: string): Promise<LiveSessionResponseDTO | null>;

    /**
     * Get all live sessions for all runs of a course master
     */
    findByCourseId(courseMasterId: string): Promise<LiveSessionResponseDTO[]>;

    /**
     * Get the current active live session for any run of a course master
     */
    findActiveByCourseId(courseMasterId: string): Promise<LiveSessionResponseDTO | null>;

    /**
     * Find live session by meetingId
     */
    findByMeetingId(meetingId: string): Promise<LiveSessionResponseDTO | null>;
}
